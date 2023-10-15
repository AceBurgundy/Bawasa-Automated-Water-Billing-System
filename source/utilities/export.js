const { ipcMain, BrowserWindow, dialog } = require("electron")
const { tryCatchWrapper, formatDate } = require("./helpers")
const Response = require("./response")
const ExcelJS = require('exceljs')
const { log } = require("console")
const fs = require("fs-extra")
const path = require("path")

const ClientPhoneNumber = require("../../models/ClientPhoneNumber")
const UserPhoneNumber = require("../../models/UserPhoneNumber")
const PartialPayment = require("../../models/PartialPayment")
const ClientAddress = require("../../models/ClientAddress")
const UserAddress = require("../../models/UserAddress")
const ClientFile = require("../../models/ClientFile")
const ClientBill = require("../../models/ClientBill")
const Client = require("../../models/Client")
const User = require("../../models/User")

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

const askDirectory = async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Directory for XLSX File',
    })

    return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null
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
                    as: "files"
                },
                { 
                    model: ClientBill, 
                    as: "bills",
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

ipcMain.handle("export-record", async (event, args) => {

    const response = new Response()
    
    const { id } = args

    return new Promise( async(resolve, reject) => {

        try {

            const getClientResponse = await getClientData(id)

            if (getClientResponse.status === "failed" || !getClientResponse.clientData) {
                reject(response.failed().addToast(getClientResponse.toast[0]).getResponse())
            }
            
            const client = getClientResponse.clientData
        
            const { 
                fullName, 
                age, 
                relationshipStatus, 
                accountNumber,
                meterNumber,
                birthDate,
                email,
                occupation
            } = client
            
            const presentAddress = client.presentAddress ?? ''
            const mainAddress = client.mainAddress ?? ''
            const phoneNumber = client.phoneNumbers ? client.phoneNumbers[0].phoneNumber : ''
            const bills = client.bills
            
            const directoryPath = await askDirectory()
                
            if (!directoryPath) {
                reject(response.failed().addToast("Directory selection canceled").getResponse())
            }
    
            const workbook = new ExcelJS.Workbook()
            
            const worksheet = workbook.addWorksheet(`${fullName}'s Data`)
        
            worksheet.properties.defaultColWidth = 25.67
            worksheet.properties.defaultRowHeight = 27.75
        
            worksheet.addRow([])
            worksheet.addRow(["Client Details"])
            worksheet.addRow([])
    
            worksheet.addRow([ "", "Account Number", "Meter Number", "Full Name", "Relationship Status", "Birth Date", "Age", "Email", "Occupation", "Present Address", "Main Address", "Phone Numbers" ])
            worksheet.addRow([ "", accountNumber, meterNumber, fullName, relationshipStatus, formatDate(birthDate), age, email, occupation, presentAddress.fullAddress, mainAddress.fullAddress, phoneNumber ? ["0", phoneNumber].join('') : '' ])
            
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
    
                    const { billNumber, firstReading, secondReading, consumption, total, status, amountPaid, balance, excess, penalty, dueDate, disconnectionDate, partialPayments } = bill
    
                    billRow = [ "", billNumber, firstReading ?? 0, secondReading ?? 0, consumption ?? 0, total ?? 0, status, amountPaid ?? 0, balance ?? 0, excess ?? 0, penalty ?? 0, formatDate(dueDate), formatDate(disconnectionDate), "" ]
    
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
    
            const fullDirectoryPath = `${directoryPath}\\${fullName}'s record`
            
            fs.ensureDir(fullDirectoryPath, error => {
                if (error) {
                    console.log(error)
                    reject(response.failed().addToast(`Error in creating new folder for ${fullName}'s export data`).getResponse())
                }
            })

            // Write the workbook to a file
            await workbook.xlsx.writeFile(`${fullDirectoryPath}\\${fullName}'s account history.xlsx`)
        
            if (client.files.length > 0) {
    
                const destinationFilePath = `${fullDirectoryPath}\\Files`

                fs.ensureDir(destinationFilePath, error => {
                    if (error) {
                        console.log(error)
                        reject(response.failed().addToast(`Error in creating files folder for ${fullName}'s export data`).getResponse())
                    }
                })

                const filesToMove = client.files.map(async (file) => {
    
                    const filePath = path.join(path.resolve(__dirname, "../../source/assets/files/"), file.name)
                    const newFilePath = path.join(`${destinationFilePath}`, file.name)
            
                    const fileExists = await fs.pathExists(filePath)
            
                    if (fileExists) {
                        await fs.copy(filePath, newFilePath)
                    } else {
                        console.log(`File ${file.name} from ${filePath} cannot be found`)
                    }
                    
                })
            
                await Promise.all(filesToMove)
            }
    
            resolve(response.success().addToast("File backup successful").getResponse())

        } catch (error) {
            console.error(`Something went wrong: ${error}`)
            reject(response.failed().addToast("Failed to export client data").getResponse())
        }
    })

 

})
