module.exports.verwijder_accenten = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

module.exports.kies_antwoorddeel=(arr)=>
    arr[Math.floor(Math.random() * arr.length)]
