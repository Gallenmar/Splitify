import React from "react";
import { View, Text, FlatList } from "react-native";

const PayerExpensesList = ({ aggregatedExpenses }) => {
	const renderExpenseItem = ({ item }) => (
		<View
			style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
		>
			<Text>{`Payer: ${item.payer}, Beneficiary: ${item.beneficiary.name}, Total Expense: ${item.beneficiary.totalExpense}`}</Text>
		</View>
	);

	return (
		<FlatList
			data={aggregatedExpenses}
			renderItem={renderExpenseItem}
			keyExtractor={(item, index) => `${index}`}
		/>
	);
};

export default PayerExpensesList;
