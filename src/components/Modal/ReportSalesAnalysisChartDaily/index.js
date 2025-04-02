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
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const ref = {
      open: ({ item }) => {
        console.log(item);
        if (item.DailySales) {
          setChartData(parseDailySales(item.DailySales));
        }
        setIsOpenModal(true);
      },
      close: () => setIsOpenModal(false),
    };
    getRef(ref);
  }, [getRef]);

  // DailySalesni formatlash funksiyasi
  const parseDailySales = (data) => {
    return Object.entries(
      data.split(', ').reduce((acc, curr) => {
        const [date, value] = curr.split(': ');
        acc[new Date(date).getTime()] = parseFloat(value);
        return acc;
      }, {})
    ).map(([date, value]) => [parseInt(date), value]);
  };

  const chartOptions = {
    chart: {
      type: 'line',
      width: 1000,
    },
    title: {
      text: 'Daily Sales Analysis'
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      },
    },
    yAxis: {
      title: {
        text: 'Sales Amount'
      }
    },
    tooltip: {
      xDateFormat: '%Y-%m-%d',
      pointFormat: '{point.y}'
    },
    series: [{
      name: 'Sales',
      data: chartData,
      color: '#ff0000'
    }]
  };

  return (
    <Modal
      isOpen={isOpenModal}
      onRequestClose={() => setIsOpenModal(false)}
      style={customStyles}
      contentLabel="Sales Analysis Chart"
      ariaHideApp={false}
    >
      <Styles>
        <div className="card df align justify" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </Styles>
    </Modal>
  );
};

export default memo(ReportSalesAnalysisChart);
