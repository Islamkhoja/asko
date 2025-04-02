import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // To'g'ri import
import moment from 'moment';
import formatterCurrency from '../../helpers/currency';
const { get } = require("lodash");
function roundMiddle(number) {
    return Math.round(number / 1000) * 1000;
}
const exportTableToExcel = async ({ mainData = [], warehouses, merchantList }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');
    let headers = [
        { header: '№', key: 'no', width: 5 },
        { header: 'Код', key: 'itemCode', width: 15 },
        { header: 'Продукция', key: 'itemName', width: 30 },
        { header: 'Кол-во (в шт.)', key: 'quantity', width: 20 },
        ...merchantList.filter(el => el.U_status == '01').map(el => {
            return { header: el.U_merchant, key: el.U_merchant, width: 20 }
        })
    ]
    worksheet.columns = headers;



    let headerRowNumber = worksheet.rowCount + 1;
    worksheet.addRow(headers.map(el => el.header));
    const headerRow = worksheet.getRow(headerRowNumber);
    headerRow.height = 30;
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.font = { size: 9, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    mainData.forEach((item, i) => {
        let prices = Object.fromEntries(merchantList.filter(el => el.U_status == '01').map(el => {
            return [el.U_merchant, formatterCurrency(roundMiddle(Number(item.PriceList.Price || 0) + ((item.PriceList.Price || 0) * (get(el, 'U_Foiz', 0) || 0) / 100)))]
        }))
        const row = worksheet.addRow({
            no: i + 1,
            itemCode: get(item, 'ItemCode'),
            itemName: get(item, 'ItemName'),
            quantity: Number(get(item, 'OnHand.OnHand', '')),
            ...prices
        });
        row.height = 23;
        row.eachCell((cell, colNumber) => {
            if (colNumber == 2) {
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            }
            else {
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            }
            cell.font = { size: 9, };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    worksheet.getRow(1).hidden = true;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Document.xlsx`); // Fayl nomi .xlsx bilan tugashi kerak
};

export { exportTableToExcel };