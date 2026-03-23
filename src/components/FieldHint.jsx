function FieldHint({ text }) {
  return (
    <span className="field-hint" tabIndex={0} title={text} aria-label={text}>
      ?
    </span>
  )
}

export default FieldHint
