import xml.etree.ElementTree as ET

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
