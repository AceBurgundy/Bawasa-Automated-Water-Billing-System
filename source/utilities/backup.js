const { ipcMain, BrowserWindow, dialog } = require("electron")
const { tryCatchWrapper, formatDate } = require("./helpers")
const Response = require("./response")

const ClientPhoneNumber = require("../../models/ClientPhoneNumber")
const UserPhoneNumber = require("../../models/UserPhoneNumber")
const PartialPayment = require("../../models/PartialPayment")
const ClientAddress = require("../../models/ClientAddress")
const UserAddress = require("../../models/UserAddress")
const ClientFile = require("../../models/ClientFile")
const ClientBill = require("../../models/ClientBill")
const Client = require("../../models/Client")
const User = require("../../models/User")

const { log } = require("console")

const rowColor = backgroundColor => {
    return {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: backgroundColor },
    }
}

const thinCellBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
}

function newRow(worksheet, cellValues, backgroundColor, includeEmptyCells = true) {
    const tableRowCellData = worksheet.addRow(cellValues)

    cellValues.forEach((value, columnIndex) => {
        if (value !== '' || includeEmptyCells) {
            const cell = tableRowCellData.getCell(columnIndex + 1)
            cell.fill = rowColor(backgroundColor)
            cell.border = thinCellBorder
        }
    })
}

ipcMain.handle("full-user-data", async (event, args) => {

    const response = new Response()

    const { id } = args

    if (!id) return response.failed().addToast("User id not found").getResponse()

	const user = await tryCatchWrapper(async () => {		
		return await User.findByPk(id, {
			include: [
				{ 
					model: UserPhoneNumber, 
					as: "phoneNumbers",
					attributes: ['phoneNumber']
				},
				{ model: UserAddress, as: "mainAddress" },
				{ model: UserAddress, as: "presentAddress" }
			]
		})
	})

	if (!user) {
		return response.responseError("User not found")
	}

})

const getClientData = async (id) => {

    const response = new Response()

    if (!id) return response.failed().addToast("Client id if not found").getResponse()

    const client = await tryCatchWrapper(async () => {		
        return await Client.findByPk(id, {
            include: [
                { 
                    model: ClientPhoneNumber, 
                    as: "phoneNumbers",
                    attributes: ['phoneNumber'],
                    order: [ 
                        ['createdAt', 'DESC']
                    ]
                },
                { 
                    model: ClientAddress, 
                    as: "mainAddress"
                },
                { 
                    model: ClientAddress, 
                    as: "presentAddress"
                },
                { 
                    model: ClientFile, 
                    as: "clientFiles"
                },
                { 
                    model: ClientBill, 
                    as: "Bills",
                    include: [
                        { 
                            model: PartialPayment,
                            as: "partialPayments",
                            order: [ 
                                ['createdAt', 'DESC']
                            ]
                        }
                    ]
                }
            ]
        })
    })    

	if (!client) {
		return response.responseError("Client not found")
	}

    return response.success().addObject("clientData", client).getResponse()

}

ipcMain.handle("backup-record", async (event, args) => {

    const response = new Response()
    
    const { id } = args

    const getClientResponse = await getClientData(id)

    if (getClientResponse.status === "failed" || !getClientResponse.clientData) {
        return response.failed().addToast(getClientResponse.toast[0]).getResponse()
    }
    
    const clientData = getClientResponse.clientData

    const { 
        fullName, 
        age, 
        relationshipStatus, 
        accountNumber,
        meterNumber,
        birthDate,
        email,
        occupation
    } = clientData
    
    const presentAddress = clientData.presentAddress ?? ''
    const mainAddress = clientData.mainAddress ?? ''
    const phoneNumber = clientData.phoneNumbers ? clientData.phoneNumbers[0].phoneNumber : ''
    const bills = clientData.Bills

    const mainWindow = BrowserWindow.getFocusedWindow()

    const ExcelJS = require('exceljs')

    tryCatchWrapper(async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet(`${fullName}'s Data`)
    
        worksheet.properties.defaultColWidth = 25.67
        worksheet.properties.defaultRowHeight = 27.75
    
        worksheet.addRow([])
        worksheet.addRow(["Client Details"])
        worksheet.addRow([])

        // Add data to the worksheet
        worksheet.addRow([
            "",
            "Account Number",
            "Meter Number",
            "Full Name",
            "Relationship Status",
            "Birth Date",
            "Age",
            "Email",
            "Occupation",
            "Present Address",
            "Main Address",
            "Phone Numbers"
        ])
        
        worksheet.addRow([
            "",
            accountNumber,
            meterNumber,
            fullName,
            relationshipStatus,
            formatDate(birthDate),
            age,
            email,
            occupation,
            presentAddress.fullAddress,
            mainAddress.fullAddress,
            phoneNumber ?? ''
        ])
        
        // Additional data
        if (bills) {
            worksheet.addRow([])
            worksheet.addRow(["Account History"])
            worksheet.addRow([])

            let currentIndex = 0

            const rowColors = ['FFFFE0', 'FFFACD', 'FFE4B5', 'FFDAB9']
            const colorIndex = currentIndex % rowColors.length
            const currentColor = rowColors[colorIndex]

            const clientBillHeaders = ["", "Bill Number", "First Reading", "Second Reading", "Consumption", "Bill Amount", "Payment Status", "Paid Amount", "Remaining Balance", "Excess", "Payment Date", "Penalty", "Due Date", "Disconnection Date" ]
            newRow(worksheet, clientBillHeaders, currentColor)

            bills.forEach((bill, index) => {
            
                currentIndex = index

                const {
                    billNumber,
                    firstReading,
                    secondReading,
                    consumption,
                    billAmount,
                    paymentStatus,
                    paymentAmount,
                    remainingBalance,
                    paymentExcess,
                    penalty,
                    dueDate,
                    disconnectionDate,
                    partialPayments
                } = bill

                billRow = [
                    "",
                    billNumber,
                    firstReading ?? 0,
                    secondReading ?? 0,
                    consumption ?? 0,
                    billAmount ?? 0,
                    paymentStatus,
                    paymentAmount ?? 0,
                    remainingBalance ?? 0,
                    paymentExcess ?? 0,
                    penalty ?? 0,
                    formatDate(dueDate),
                    formatDate(disconnectionDate),
                    ""
                ]

                worksheet.addRow([])

                newRow(worksheet, billRow, currentColor)

                if (partialPayments.length > 0) {

                    worksheet.addRow([])

                    const partialPaymentHeaders = ['', '', '', '', '', 'Partial Payments', 'Amount Paid', 'Payment Date']
                    newRow(worksheet, partialPaymentHeaders, currentColor, false)
                                    
                    // Add partial payment data rows with background color
                    partialPayments.forEach(partialPayment => {
                        const { amountPaid, paymentDate } = partialPayment
                        const rowValues = ['', '', '', '', '', '', amountPaid, paymentDate ? formatDate(paymentDate) : '']
                        newRow(worksheet, rowValues, currentColor, false)
                    })
                }
            })
        }

        worksheet.eachRow({ includeEmpty: false }, row => {
            row.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true,
            }
        })

        const firstColumn = worksheet.getColumn(1)
        firstColumn.width = 10

        firstColumn.eachCell({ includeEmpty: true }, cell => {
            cell.style = {}
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true,
            }
        })

        // Write the workbook to a file
        await workbook.xlsx.writeFile('D:\\New folder\\test.xlsx')
    
        return response.success().addToast("File backup successful").getResponse()
    }).catch(error => log(`Something went wrong: ${error}`))

})
