import React, { memo, useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Modal from 'react-modal';
import Styles from './Styles';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    width: '1200px',
    height: "500px",
    padding: 0,
    overflow: 'none',
    borderRadius: 0
  },
  overlay: {
    background: '#0000008D',
    zIndex: '1000'
  },
};

const ReportSalesAnalysisChart = ({ getRef }) => {
  const { t } = useTranslation();
  const { getMe } = useSelector(state => state.main);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [mainData, setMainData] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const ref = {
      open: (data, categories) => {
        setGroups(categories);
        setMainData(data);
        setIsOpenModal(true);
      },
      close: () => setIsOpenModal(false),
    };
    getRef(ref);
  }, [getRef]);

  // **Umumiy funksiya - Kategoriya yoki Brend bo‘yicha chart ma'lumotlarini generatsiya qiladi**
  const generateChartData = (data, groupKey, nameKey) => {
    let uniqueKeys = [...new Set(data.map(item => item[groupKey]))];
    let result = uniqueKeys.map(key => {
      return {
        name: groupKey === 'ItmsGrpCod'
          ? groups.find(g => g.ItmsGrpCod == key)?.ItmsGrpNam ?? "Unknown"
          : data.find(item => item[groupKey] == key)?.[nameKey] ?? "Unknown",
        y: data.reduce((sum, item) => (item[groupKey] == key ? sum + Number(item?.Quantity || 0) : sum), 0)
      };
    });
    return [{
      name: 'Sales',
      colorByPoint: true,
      data: result.filter(item => item.y != 0)
    }];
  };

  const chartOptions = (title, seriesData) => ({
    chart: { type: 'column', width: 530 },
    credits: { enabled: false },
    title: { text: title },
    xAxis: { type: 'category', labels: { rotation: 0 } },
    yAxis: { title: { text: '' } },
    legend: { enabled: false },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: { enabled: true, format: '{point.y:.1f}' }
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> of total<br/>'
    },
    series: seriesData
  });

  return (
    <Modal
      isOpen={isOpenModal}
      onRequestClose={() => setIsOpenModal(false)}
      style={customStyles}
      contentLabel="Sales Analysis Chart"
      ariaHideApp={false}
    >
      <Styles>
        <div className="card df align justify">
          <HighchartsReact highcharts={Highcharts} options={chartOptions("Category Analysis", generateChartData(mainData, 'ItmsGrpCod', 'Name'))} />
          <HighchartsReact highcharts={Highcharts} options={chartOptions("Brand Analysis", generateChartData(mainData, 'U_brend', 'Name'))} />
        </div>
      </Styles>
    </Modal>
  );
};

export default memo(ReportSalesAnalysisChart);
