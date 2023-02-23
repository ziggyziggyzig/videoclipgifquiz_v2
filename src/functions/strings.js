const padLeadingZeros = (num, size, string = String.fromCharCode(160)) => {
    let s = num + ""
    while (s.length < size) s = string + s
    return s
}

export {padLeadingZeros}