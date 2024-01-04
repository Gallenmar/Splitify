// PeopleTable.js

import React from "react";
import { Table, Row, Rows } from "react-native-table-component";
import { View, Text } from "react-native";

const PeopleTable = ({ tableData }) => {
	// // Get the number of elements in the people list
	// const n = people.length;

	// // Create an n by n matrix for the table data
	// const tableData = Array.from({ length: n + 1 }, () => Array(n + 1).fill(""));

	// // Fill the top row with names from people list
	// for (let i = 1; i <= n; i++) {
	// 	tableData[0][i] = people[i - 1].text; // Top row
	// 	tableData[i][0] = people[i - 1].text; // Left column
	// }

	// // Fill the rest of the table data
	// for (let i = 1; i <= n; i++) {
	// 	for (let j = 1; j <= n; j++) {
	// 		tableData[i][j] = ""; // You can fill the rest of the data as needed
	// 	}
	// }

	// console.log(tableData);

	// // Populate the tableData with people's names
	// // people.forEach((person, index) => {
	// // 	tableData[index][index] = person.text;
	// // });

	// return (
	// 	<View style={{ padding: 0 }}>
	// 		<Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
	// 			<Rows data={tableData} textStyle={{ color: "white" }} />
	// 		</Table>
	// 	</View>
	// );

	const newTextArray = tableData.map((row) => row.map((item) => item.text));

	return (
		<View style={{ padding: 0 }}>
			<Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
				<Rows data={newTextArray} textStyle={{ color: "white" }} />
			</Table>
		</View>
	);
};

export default PeopleTable;
