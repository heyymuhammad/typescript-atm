#! /usr/bin/env node
import inquirer from "inquirer";
const id = "MTA827";
const pin = 3043;
const answer = await inquirer.prompt([
    {
        name: "userId",
        type: "string",
        message: "Enter your ID: ",
    },
    {
        name: "userPin",
        type: "number",
        message: "Enter your PIN: ",
    }
]);
if (answer.userId == id && answer.userPin == pin) {
    console.log("You are login successfully");
}
else {
    console.log("Invalid ID or PIN.");
}
