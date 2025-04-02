import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
// variable-pie moduli import qilinmoqda
import variablePie from "highcharts/modules/variable-pie";

// // Bu modulni Highcharts ga qo‘shish
// if (typeof variablePie === "function") {
//     variablePie(Highcharts);
// } else {
//     variablePie.default(Highcharts);
// }
const ChartComponent = ({ data }) => {
    // Ranglar va AcctCode uchun moslashtirilgan ranglar

    // '#4caefe',
    //     '#3dc3e8',
    //     '#2dd9db',
    //     '#1feeaf',
    //     '#0ff3a0',
    //     '#00e887',
    //     '#23e274'
    const colorMap = {
        '50103': '#4caefe',  // Касса сум - магазины
        '57101': '#3dc3e8',  // Терминал
        '57203': '#2dd9db',  // ZOODMALL
        '57202': '#1feeaf',  // ALIF
        '57201': '#0ff3a0',  // UZUM
    };
    const getColorByBalance = (balance) => {
        return balance > 40000000 ? '#4caefe' :  // Balans 40 milliondan katta
            balance > 30000000 ? '#3dc3e8' :  // Balans 30 milliondan katta
                balance > 20000000 ? '#2dd9db' :  // Balans 20 milliondan katta
                    balance > 10000000 ? '#1feeaf' :  // Balans 10 milliondan katta
                        balance > 5000000 ? '#0ff3a0' :   // Balans 5 milliondan katta
                            '#ff5733';                        // Balans 5 milliondan kichik
    };

    // Data-ni AcctCode bo'yicha tartiblash
    const sortedData = data.sort((a, b) => a.Balance - b.Balance);

    // Diagrammaga moslashtirish
    const chartData = sortedData.map(item => ({
        name: item.AcctName,
        y: item.Balance,
        z: sortedData[sortedData.length - 1].Balance * 0.05,  // Masalan, z = y ning 5% i
        color: getColorByBalance(item.Balance),  // Agar rang bo'lmasa, default rang
    }));

    const options = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'variablepie',
            height: 600,
            width: 600,
        },
        title: {
            text: "Кассовый отчет в виде диаграммы",
        },
        tooltip: {
            headerFormat: "",
            pointFormat:
                '<span style="color:{point.color}">\u25CF</span> <b>{point.name}</b><br/>' +
                'Balance: <b>{point.y}</b><br/>'
        },
        series: [
            {
                minPointSize: 30,  // Nuqtalarni kattaroq qilish
                innerSize: "30%",  // Ichki qismni kattaroq qilish
                zMin: 0,
                name: "Accounts",
                borderRadius: 5,
                data: chartData,
            },
        ],
        credits: {
            enabled: false,
        },
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ChartComponent;