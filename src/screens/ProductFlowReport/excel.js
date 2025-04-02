import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // To'g'ri import
import moment from 'moment';
const { get } = require("lodash");

const exportTableToExcel = async ({ mainData = [], warehouses }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    worksheet.columns = [
        { header: '№', key: 'no', width: 5 },
        { header: 'Склад', key: 'branch', width: 25 },
        { header: 'Код', key: 'itemCode', width: 15 },
        { header: 'Продукция', key: 'itemName', width: 30 },
        { header: 'Кол-во (в шт.)', key: 'quantity', width: 20 },
        { header: 'Бранд', key: 'Name', width: 25 },
        { header: 'Мера', key: 'U_Article', width: 15 },
    ];

    let headerRowNumber = worksheet.rowCount + 1;
    worksheet.addRow(['№', 'Склад', 'Код', 'Продукция', 'Кол-во (в шт.)', 'Бранд', 'Мера']);
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
        const row = worksheet.addRow({
            no: i + 1,
            branch: `${get(item, 'OnHand.ListName', '')} - ${warehouses.find(el => get(el, 'WhsCode') == get(item, 'OnHand.ListName', ''))?.WhsName}`,
            itemCode: get(item, 'ItemCode'),
            itemName: get(item, 'ItemName'),
            quantity: Number(get(item, 'OnHand.OnHand', '')),
            Name: get(item, 'Name'),
            U_Article: get(item, 'U_Article')
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