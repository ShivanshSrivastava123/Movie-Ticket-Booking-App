const timeFormat = (time) => {
    let hours = Math.floor(time/60)
    let min = time - (hours*60);
    return `${hours}h ${min}m`
}

export default timeFormat;
