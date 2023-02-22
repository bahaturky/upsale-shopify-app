function tryParseInt(value) {
  return (value && parseInt(value)) || null;
}

export default tryParseInt;
