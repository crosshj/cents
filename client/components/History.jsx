import React from 'react';
import moment from 'moment';
import ReactHighcharts from 'react-highcharts';

function formatGraphData(json) {
    if (json.error) {
        return [];
    }
    var formattedData = (json || []).map(x => [
        moment(x.date.replace('_', ' ')).valueOf(),
        Number(x.value)
    ]);
    return formattedData;
}

var chartConfig = (data) => ({
    chart: {
        //renderTo: $container,
        marginTop: 30,
        height: 300,
        zoomType: 'x',
        panKey: 'shift',
        //https://www.highcharts.com/docs/chart-design-and-style/style-by-css
        styledMode: true
    },
    plotOptions: {
        series: {
            pointPadding: 200,
        }
    },
    title: {
        text: ''
    },
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
        formatter: function () {
            return false; // also see css for .highcharts-halo
            // return `
            //     <b>$${this.y}</b>
            //     <br/>
            //     <p>${moment(this.x).format('MMM DD YYYY, HH:mm a')}</p>
            // `;
        }
    },
    xAxis: {
        type: 'datetime',
    },
    yAxis: {
        title: ''
    },
    series: [{
        name: '',
        data
    }]
});


function History({ data=[], width, series, type }) {
    const formattedData = formatGraphData(data);
    //console.log({data, series});
    const config = chartConfig(formattedData);
    if(width){
        config.chart.width = width;
    }
    if(series){
        config.series = series
            .map(x => Object.assign(
                {}, x,
                { data: formatGraphData(x.data) }
            ));
    }
    if(type){
        config.chart.type = type;
    }
    return (
        <React.Fragment>
            {!data.error &&
                <ReactHighcharts config={config}></ReactHighcharts>
            }
            {data.error &&
                <div className="offline">offline</div>
            }
        </React.Fragment>
    );
}

export default History;
