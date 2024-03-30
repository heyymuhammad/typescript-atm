#! /usr/bin/env node
import inquirer from "inquirer";
import fs from 'fs';
let date = new Date();
// Reading PIN from file
const pinStr = fs.readFileSync("pin.txt", 'utf8');
let pin = parseInt(pinStr);
let transactionHistory = fs.readFileSync("transaction.csv", 'utf8');
let readBalance;
if (transactionHistory.length > 10) {
    readBalance = transactionHistory.split("\n");
    readBalance = readBalance[readBalance.length - 2].split(",");
}
let balance = readBalance ? parseInt(readBalance[2]) : 0;
let transactionAmount, transactionMethod;
const answer = await inquirer.prompt([
    {
        name: "userPin",
        type: "number",
        message: "Enter your PIN: ",
    }
]);
if (answer.userPin == pin) {
    console.log("Correct Pin Code");
    let operationAns = await inquirer.prompt([
        {
            name: "operation",
            type: "list",
            message: "What would you like?",
            choices: ["Withdraw", "Check Balance", "Fast Cash", "Change PIN", "View Transaction History", "Transfer Money"]
        }
    ]);
    if (operationAns.operation == "Withdraw") {
        let withdrawAmnt = await inquirer.prompt([
            {
                name: "amount",
                type: "number",
                message: "Enter amount: "
            }
        ]);
        if (withdrawAmnt.amount <= balance) {
            transactionAmount = withdrawAmnt.amount;
            let wantSlip = await inquirer.prompt([
                {
                    name: "answer",
                    type: "list",
                    message: "Do you want slip?",
                    choices: ["Yes", "No"]
                }
            ]);
            if (wantSlip.answer == "Yes") {
                console.log(`Branch Name: Shahra e Faisal Branch`);
                console.log(`Previous Balance: ${balance} PKR`);
                console.log(`Withdraw Amount: ${withdrawAmnt.amount} PKR`);
                console.log(`${date}`);
            }
            balance -= withdrawAmnt.amount;
            console.log(`Your remaining balance is: ${balance} PKR`);
        }
        else {
            console.log("Insufficient balance.");
        }
    }
    else if (operationAns.operation == "Check Balance") {
        console.log(`Your current balance is: ${balance} PKR`);
    }
    else if (operationAns.operation == "Fast Cash") {
        let fastCashAmnt = await inquirer.prompt([
            {
                name: "amount",
                type: "list",
                choices: [1000, 5000, 10000, 15000, 20000, 25000, 30000]
            }
        ]);
        if (fastCashAmnt.amount <= balance) {
            transactionAmount = fastCashAmnt.amount;
            let wantSlip = await inquirer.prompt([
                {
                    name: "answer",
                    type: "list",
                    message: "Do you want slip?",
                    choices: ["Yes", "No"]
                }
            ]);
            if (wantSlip.answer == "Yes") {
                console.log(`Branch Name: Shahra e Faisal Branch`);
                console.log(`Previous Balance: ${balance} PKR`);
                console.log(`Withdraw Amount: ${fastCashAmnt.amount} PKR`);
                console.log(`${date}`);
            }
            balance -= fastCashAmnt.amount;
            console.log(`Your remaining balance is: ${balance} PKR`);
        }
        else {
            console.log("Insufficient balance.");
        }
    }
    else if (operationAns.operation == "Change PIN") {
        let oldPin = await inquirer.prompt([
            {
                name: "userPin",
                type: "number",
                message: "Enter your old PIN: ",
            }
        ]);
        if (oldPin.userPin == pin) {
            let newPin = await inquirer.prompt([
                {
                    name: "userPin",
                    type: "number",
                    message: "Enter your new PIN: ",
                }
            ]);
            fs.writeFileSync("pin.txt", newPin.userPin.toString(), 'utf8');
            console.log("Your PIN is successfully changed.");
        }
    }
    else if (operationAns.operation == "View Transaction History") {
        transactionHistory ? console.log(transactionHistory) : console.log("You have not done any transaction.");
    }
    else if (operationAns.operation == "Transfer Money") {
        let verifyPin = await inquirer.prompt([
            {
                name: "userPin",
                type: "number",
                message: "Enter PIN to verify: ",
            }
        ]);
        if (verifyPin.userPin == pin) {
            console.log("Please enter the information of the recieving account.");
            let receivingAccount = await inquirer.prompt([
                {
                    name: "accountNo",
                    type: "string",
                    message: "Account No: "
                },
                {
                    name: "accountName",
                    type: "string",
                    message: "Placeholder Name: "
                },
                {
                    name: "transferAmnt",
                    type: "string",
                    message: "Amount (Enter amount between 100 PKR - 50,000 PKR): "
                }
            ]);
            if (receivingAccount.transferAmnt > balance) {
                console.log(`Insufficient Balance. Please enter amount between not more than ${balance}.`);
            }
            else if (receivingAccount.accountNo.length != 12 || !receivingAccount.accountName) {
                console.log("Incorrect information. Try Again!");
            }
            else {
                console.log("Your amount has been transfered successfully to the following account.\n");
                console.log(`Account No: ${receivingAccount.accountNo}`);
                console.log(`Placeholder Name: ${receivingAccount.accountName}`);
                console.log(`Amount Transfered: ${receivingAccount.transferAmnt} PKR\n`);
                transactionAmount = receivingAccount.transferAmnt;
                transactionMethod = "Transfered";
                balance -= receivingAccount.transferAmnt;
                console.log(`Your remaining balance is: ${balance} PKR`);
            }
        }
    }
    if (transactionAmount) {
        const transaction = `${transactionAmount},${date},${balance},${transactionMethod ? transactionMethod : "Credited"}`;
        fs.appendFileSync("transaction.csv", transaction + '\n', 'utf8');
    }
}
else {
    console.log("Invalid Pin Code.");
}
