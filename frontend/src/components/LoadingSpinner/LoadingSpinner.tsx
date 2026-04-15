import "./LoadingSpinner.css"

interface LoadingSpinnerProps {
    color?: string;
    size?: "small" | "medium" | "large";
}

export default function LoadingSpinner({
    color = "green", 
    size = "medium"
}: LoadingSpinnerProps){
    return <div className={`loading-spinner loading-spinner--${size}`} style={{borderTopColor: color}}/>;
}
