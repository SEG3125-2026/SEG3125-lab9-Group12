function ProgressBar({ label, value, helper }) {
  return (
    <div className="progress-block">
      <div className="progress-block__labels">
        <span>{label}</span>
        <span>{helper}</span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
