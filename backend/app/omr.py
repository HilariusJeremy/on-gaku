import xml.etree.ElementTree as ET
import cv2

def parse_musicxml(filepath: str) -> dict:
    tree = ET.parse(filepath)
    root = tree.getroot()

    # Extract marking of bass and treble clefs and key signature
    FLATS_ORDER  = ["B", "E", "A", "D", "G", "C", "F"]
    SHARPS_ORDER = ["F", "C", "G", "D", "A", "E", "B"]
    clef_mark = {}
    fifths = 0
    measures = []

    key_signature = ""

    for part in root.findall('part'):
        for measure in part.findall('measure'):
            for attr in measure.findall('attributes'):
                for clef in attr.findall('clef'):
                    sign = clef.find('sign')
                    if sign.text == 'G':
                        clef_mark[clef.attrib['number']] = 'treble'
                    elif sign.text == 'F':
                        clef_mark[clef.attrib['number']] = 'bass'

                key = attr.find('key')
                fifths = int(key.find('fifths').text)
                key_signature_order = FLATS_ORDER[:abs(fifths)] if fifths<0 else SHARPS_ORDER[:abs(fifths)] if fifths >0 else []
                key_signature = "♭" if fifths<0 else "♯" if fifths>0 else ""

            notes = measure.findall('note')

            bass = []
            treble = []

            for note in notes:
                staff = note.find('staff')
                rest = note.find('rest')

                if rest is not None:
                    if rest.attrib.get('measure') == 'yes':
                        if clef_mark[staff.text] == 'treble' and not treble:
                            treble = ['rest']  # only set rest if no notes found yet
                        elif clef_mark[staff.text] == 'bass' and not bass:
                            bass = ['rest']  # only set rest if no notes found yet
                    continue

                if clef_mark[staff.text] == 'treble' and treble == ['rest']:
                    continue
                if clef_mark[staff.text] == 'bass' and bass == ['rest']:
                    continue

                for pitch in note.findall('pitch'):
                    step = pitch.find('step')
                    octave = pitch.find('octave')

                    note_after_key_signature = (
                        f"{step.text}{key_signature}{octave.text}"
                        if step.text in key_signature_order
                        else f"{step.text}{octave.text}"
                    )

                    if clef_mark[staff.text] == 'bass':
                        bass.append(note_after_key_signature)
                    elif clef_mark[staff.text] == 'treble':
                        treble.append(note_after_key_signature)

            measures.append({
                "number": int(measure.attrib['number']),
                "treble": treble,
                "bass": bass
            })

    accidentals = [note + key_signature for note in key_signature_order] if key_signature else []
    flat_or_sharp_or_none = (
        "flat" if key_signature == "♭"
        else "sharp" if key_signature == "♯"
        else None
    )

    display = f"{len(key_signature_order)} {flat_or_sharp_or_none}(s): {', '.join(accidentals)}" if key_signature else "C major (no accidentals)"

    return {
        "key": {
            "fifths": fifths,
            "accidentals": accidentals,
            "display": display
        },
        "measures": measures
    }

def extract_measure_bboxes(num_groups, staffs, barlines, img_width):
    barlines = sorted(barlines, key=lambda barline: (barline.group, barline.bbox[0]))
    bbox_coords = []
    for group in range(num_groups):
        y_upper, y_lower = None, None
        for staff in staffs.tolist()[0]:
            if staff.group == group:
                if staff.track == 0:
                    y_upper = staff.y_upper
                if staff.track == 1:
                    y_lower = staff.y_lower

        group_barlines = [b for b in barlines if b.group == group]
        group_bboxes = []

        for i in range(len(group_barlines) + 1):
            x1 = 0 if i == 0 else int(group_barlines[i-1].bbox[2])
            x2 = img_width if i == len(group_barlines) else int(group_barlines[i].bbox[0])

            if x2 - x1 < 100:  # filter repeat barline slivers
                continue
            group_bboxes.append((x1, y_upper, x2, y_lower))
            
        bbox_coords.extend(group_bboxes[:-1])  # drop the last (empty trailing space)
    return bbox_coords

def large_bbox_contains_small_bbox(large_bbox, small_bbox):
        return (
            (large_bbox['x1'] <= small_bbox['x1'] <= large_bbox['x2']) and 
            (large_bbox['y1'] <= small_bbox['y1'] <= large_bbox['y2'])
        )

def extract_notes_from_oemer(notes_layer) -> list[dict]:
    output = []
    for note in notes_layer.tolist():
        clef_type = 'G_CLEF' if note.track == 0 else 'F_CLEF'
        pos = int(note.staff_line_pos)
        order = ['D', 'E', 'F', 'G', 'A', 'B', 'C'] if clef_type == 'G_CLEF' else ['F', 'G', 'A', 'B', 'C', 'D', 'E']

        note_name = order[pos % 7] if pos >= 0 else order[pos % -7]
        octave_offset = 4 if clef_type == 'G_CLEF' else 2
        pitch_offset = 1 if clef_type == 'G_CLEF' else 3
        octave = (pos + pitch_offset) // 7 + octave_offset
        
        # Handle accidentals
        accidental = 0
        if note.sfn:
            from oemer.symbol_extraction import SfnType
            if note.sfn == SfnType.SHARP:
                accidental = 1
            elif note.sfn == SfnType.FLAT:
                accidental = -1
        
        output.append({
        'id': note.id,
        'pitch': f"{note_name}{octave}{'#' if accidental==1 else '♭' if accidental==-1 else ''}",
        'bbox': {'x1': int(note.bbox[0]), 'y1': int(note.bbox[1]), 'x2': int(note.bbox[2]), 'y2': int(note.bbox[3])},
        'track': note.track,
    })
        
    output.sort(key=lambda note: (note['bbox']['x1'], note['bbox']['y1']))
    return output

def link_noteheads_to_measures(result, notes):
    for measure in result['measures']:
        measure['notes'] = [
            note for note in notes
            if large_bbox_contains_small_bbox(measure['bbox'], note['bbox'])
        ]
    return result

def render_annotated_image(result, img):
    for measure in result['measures']:
        for note in measure['notes']:
            bbox = note['bbox']
            notehead_width = bbox['x2'] - bbox['x1']
            notehead_height = bbox['y2'] - bbox['y1']
            
            # Scale font size proportionally to notehead size
            # Adjust the divisor (50) based on your preferred scale
            font_scale = max(notehead_width, notehead_height) / 25
            
            x = bbox['x2'] + 10
            y = bbox['y2']
            
            pitch_label = note['pitch'].replace('♭', 'b').replace('♯', '#')

            cv2.putText(img, pitch_label, (x, y),
                       cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), 2)
    return img
