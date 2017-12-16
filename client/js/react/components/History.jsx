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
        height: 300
    },
    title: {
        text: ''
    },
    legend: {
        enabled: false
    },
    credits: {
        enabled: false
    },
    tooltip: {
        formatter: function () {
            return `
                <b>$${this.y}</b>
                <br/>
                <p>${moment(this.x).format('MMM DD YYYY, HH:mm a')}</p>
            `;
        }
    },
    xAxis: {
        type: 'datetime'
    },
    yAxis: {
        title: ''
    },
    series: [{
        name: '',
        data
    }]
});


function History({ data }) {
    const formattedData = formatGraphData(data);
    return <React.Fragment>
        {!data.error &&
            <ReactHighcharts config={chartConfig(formattedData)}></ReactHighcharts>
        }
        {data.error &&
            <div className="offline">offline</div>
        }
    </React.Fragment>;
}

export default History;
