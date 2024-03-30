#! /usr/bin/env node

import inquirer from "inquirer";
import fs from 'fs';

let date: Date = new Date();
// Reading PIN from file
const pinStr = fs.readFileSync("pin.txt", 'utf8');
let pin = parseInt(pinStr);

// Reading Balance from the last transaction history
let transactionHistory = fs.readFileSync("transaction.csv", 'utf8');
let readBalance
if (transactionHistory.length > 10) {
    readBalance = transactionHistory.split("\n");
    readBalance = readBalance[readBalance.length -2].split(",");
}

let balance = readBalance?parseInt(readBalance[2]):0;
let transactionAmount, transactionMethod;
// User Login
const answer = await inquirer.prompt([
    {
        name: "userPin",
        type: "number",
        message: "Enter your PIN: ",
    }
]);
// Verifying login and Showing dashboard to the user
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
    //Withdraw feature
    if (operationAns.operation == "Withdraw") {
        let withdrawAmnt = await inquirer.prompt([
        {
            name: "amount",
            type: "number",
            message: "Enter amount: "
        }
        ]);
        // Verifying required amount in account before withdraw
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
            // Asking for the Slip
            if (wantSlip.answer=="Yes") {
                console.log(`Branch Name: Shahra e Faisal Branch`);
                console.log(`Previous Balance: ${balance} PKR`);
                console.log(`Withdraw Amount: ${withdrawAmnt.amount} PKR`);
                console.log(`${date}`);
            }
            // Modifying balance after successful withdraw
            balance -= withdrawAmnt.amount;
            console.log(`Your remaining balance is: ${balance} PKR`);
        }
        else {
            console.log("Insufficient balance.");
        }
    }
    // Check balance feature
    else if (operationAns.operation == "Check Balance") {
        console.log(`Your current balance is: ${balance} PKR`);
    }
    // Fast cash feature
    else if (operationAns.operation == "Fast Cash") {
        // User can only choose limited options for fast cash
        let fastCashAmnt = await inquirer.prompt([
            {
                name: "amount",
                type: "list",
                choices: [1000, 5000, 10000, 15000, 20000, 25000, 30000]
            }
        ]);
        // Verifying required amount in account before withdraw
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
            // Asking for the Slip
            if (wantSlip.answer=="Yes") {
                console.log(`Branch Name: Shahra e Faisal Branch`);
                console.log(`Previous Balance: ${balance} PKR`);
                console.log(`Withdraw Amount: ${fastCashAmnt.amount} PKR`);
                console.log(`${date}`);
            }
            // Modifying balance after successful withdraw
            balance -= fastCashAmnt.amount;
            console.log(`Your remaining balance is: ${balance} PKR`);
        }
        else {
            console.log("Insufficient balance.");
        }
    }
    // Change PIN feature
    else if (operationAns.operation == "Change PIN") {
        // Verifying before changing PIN
        let oldPin = await inquirer.prompt([
            {
                name: "userPin",
                type: "number",
                message: "Enter your old PIN: ",
            }
        ]);
        // After verification updating pin in pin.txt file
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
    // View transaction history feature
    else if (operationAns.operation ==  "View Transaction History") {
        transactionHistory?console.log(transactionHistory):console.log("You have not done any transaction.");
    }
    // Transfer money feature
    else if (operationAns.operation == "Transfer Money") {
        // Verifying before money transfer
        let verifyPin = await inquirer.prompt([
            {
                name: "userPin",
                type: "number",
                message: "Enter PIN to verify: ",
            }
        ]);
        // After verification user needs to provide info about the recieving account
        if (verifyPin.userPin == pin) {
            console.log("Please enter the information of the recieving account.")
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
            // Incase of more transfer amount than current balance
            if (receivingAccount.transferAmnt > balance) {
                console.log(`Insufficient Balance. Please enter amount between not more than ${balance}.`);
            }
            // Incase of incorrect informations
            else if (receivingAccount.accountNo.length != 12 || !receivingAccount.accountName) {
                console.log("Incorrect information. Try Again!");
            }
            // When everything is perfectly fine
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
    // Adding transaction history to transaction.csv file
    if (transactionAmount) {
        const transaction = `${transactionAmount},${date},${balance},${transactionMethod?transactionMethod:"Debited"}`;
        fs.appendFileSync("transaction.csv", transaction + '\n', 'utf8');
    }
}
else {
    console.log("Invalid Pin Code.");
}