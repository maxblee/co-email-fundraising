const padding = {left: 100, right: 150, top: 10, bottom: 10};

const displayGraphic = function(word, summaryInfo) {
    displayDescription(word, summaryInfo);
    const graphicContainer = d3.select("#email-svg-graphic");
    const svgWidth = graphicContainer.node().getBoundingClientRect().width;
    const width = Math.min(svgWidth);
    const categoryAxis = graphicContainer.append("g")
        .attr("transform", "translate(120, 0)")
        .attr("class", "gfx__axis axis__names");
    const wordInfo = summaryInfo.emails;
    const scaleX = d3.scaleTime()
        .domain(d3.extent(wordInfo.map(email => Date.parse(email.msg_date))))
        .nice()
        .range([0, width - padding.right]);
    const axisX = d3.axisBottom()
        .scale(scaleX)
        .ticks(3)
        .tickFormat(d3.timeFormat(svgWidth < 500 ? "%-m/%y" : "%b %Y"));
    const scaleY = d3.scaleBand()
        .domain(Object.keys(summaryInfo).filter(d => d !== "words" && d !== "emails"))
        .range([0, 100]);
    const axisY = d3.axisLeft()
        .scale(scaleY);
    categoryAxis.call(axisY)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("line").remove());
    const dateAxis = graphicContainer.append("g")
        .attr("transform", "translate(125,100)")
        .attr("class", "gfx__axis axis__dates");
    dateAxis.call(axisX)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("line").remove());
    graphicContainer.append("g").selectAll("rect")
        .data(wordInfo).enter()
        .append("rect")
            .attr("x", d => scaleX(Date.parse(d.msg_date)) + 125)
            .attr("y", d => scaleY(d.msg_candidate) + 12.5)
            .attr("class", d => {
                const candClass = d.msg_candidate.toLowerCase();
                const filledClass = d[word] ? "filled" : "empty";
                return candClass + " " + filledClass + " gfx__rect";
            });
}

const displayDescription = function(word,summaryInfo) {
    d3.select(".gfx__word__sel").text(word);
    const gardnerPct = summaryInfo["Gardner"][word];
    d3.select("#gardner-data-selection")
        .text(descriptionMessage(gardnerPct, "Gardner"));
    const hickPct = summaryInfo["Hickenlooper"][word];
    d3.select("#hickenlooper-data-selection")
        .text(descriptionMessage(hickPct, "Hickenlooper"));
}

const descriptionMessage = function(pct, candidate) {
    if (pct === "0.00%") {
        return `${candidate} did not use this word or phrase in any of his emails.`
    } else {
        return `${candidate} used this word or phrase in ${pct} of his emails.`
    }
}

const yAxis = function(scale) {
    return d3.axisLeft()
        .scale(scale);
}

const updateSelection = function(summaryInfo) {
    d3.select("#word-selection").selectAll("option")
        .data(summaryInfo.words).enter()
        .append("option").text((d) => d);
}

const getCurrentWord = () => {
    const selection = document.getElementById("word-selection");
    return selection.options[selection.selectedIndex].value;
}

const redraw = function(data) {
    d3.select("#email-svg-graphic").selectAll("g").remove();
                const word = getCurrentWord();
                displayGraphic(word, data);
}

d3.json("emails.json")
    .then(function(data) {
        updateSelection(data);
        const word = getCurrentWord();
        displayGraphic(word, data);
        d3.select("#word-selection")
            .on("change", () => redraw(data));
        window.onresize = () => redraw(data);
    }).catch((err) => {console.error(err);});