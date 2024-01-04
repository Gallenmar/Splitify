import { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	FlatList,
	Button,
	Text,
	TouchableOpacity,
	SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

//import GoalItem from "./components/GoalItem";
//import GoalInput from "./components/GoalInput";
import NameInput from "./components/NameInput";
import TransactionInputModal from "./components/TransactionInput";
import PeopleTable from "./components/PeopleTable";
import PayerExpensesList from "./components/PayerExpensesList";

export default function App() {
	const [modalIsVisible, setModalIsVisible] = useState(false);
	const [transactionModalIsVisible, setTransactionModalIsVisible] =
		useState(false);

	const [people, setPeople] = useState([]);
	const [history, setHistory] = useState([]);
	const [sums, setSums] = useState([]);
	const [tableData, setTableData] = useState([]);

	//TODO
	//create an empty list
	//create a setter (just like addPerson)
	//prevArray + {payer, [list], id}
	//this list should be created in TIM
	//list = list(ben,price)
	//store payer and ben as id
	//+create a deleter

	function updateTableData() {
		const payerExpenses = {};
		history.forEach((payment) => {
			const payer = payment.data.payer.id; //id+text
			const beneficiaries = payment.data.beneficiaries; //name+price+id

			// If the payer is not in the 'payerExpenses' object, initialize it
			if (!payerExpenses[payer]) {
				payerExpenses[payer] = {};
			}

			// Iterate through the beneficiaries and update the expenses for each payer
			beneficiaries.forEach((beneficiary) => {
				const { id, name, price } = beneficiary;

				// If the beneficiary is not in the payer's expenses, initialize it
				if (!payerExpenses[payer][id]) {
					payerExpenses[payer][id] = {
						name: name,
						totalExpense: 0,
					};
				}

				// Update the total expense for the beneficiary and payer
				payerExpenses[payer][id].totalExpense += parseInt(price, 10);
			});
		});
		const aggregatedExpenses = [];

		// Iterate through the payerExpenses object and push the data to the array
		for (const payer in payerExpenses) {
			for (const beneficiaryId in payerExpenses[payer]) {
				console.log("payer: ", payer.text);
				aggregatedExpenses.push({
					payer: payer,
					beneficiary: {
						id: beneficiaryId,
						name: payerExpenses[payer][beneficiaryId].name,
						totalExpense: payerExpenses[payer][beneficiaryId].totalExpense,
					},
				});
			}
		}

		setSums(aggregatedExpenses);
		console.log("expenses: ", aggregatedExpenses);

		const tableDataTmp = [
			["", ...people], // First row with empty cell and people's names
			...people.map((rowPerson) => [
				rowPerson,
				...Array(people.length)
					.fill()
					.map(() => ({ text: "" })),
			]),
		];
		// sift thru the table
		for (let row = 1; row < tableDataTmp.length; row++) {
			for (let col = 1; col < tableDataTmp[row].length; col++) {
				const idFirstRowSameCol = tableDataTmp[0][col].id;
				const idSameRowFirstCol = tableDataTmp[row][0].id;
				console.log("Current cell:", tableDataTmp[row][col], row, col);
				console.log("idFirstRowSameCol:", idFirstRowSameCol);
				console.log("idSameRowFirstCol:", idSameRowFirstCol);

				// Check if the payer exists in the payerExpenses object
				if (payerExpenses[idFirstRowSameCol]) {
					// Check if the beneficiary exists for the specified payer
					if (payerExpenses[idFirstRowSameCol][idSameRowFirstCol]) {
						// Access the totalExpense for the specified payer and beneficiary
						console.log(
							"theoretical expense: ",
							payerExpenses[idFirstRowSameCol][idSameRowFirstCol].totalExpense
						);
						tableDataTmp[row][col].text =
							payerExpenses[idFirstRowSameCol][idSameRowFirstCol].totalExpense;

						console.log("tabledata: ", tableDataTmp);

						// Now 'totalExpense' contains the total expense for the specified payer and beneficiary
						// totalExpence here not working because it doesn't exist
						console.log(
							`Total expense for payer ${idFirstRowSameCol} and beneficiary ${idSameRowFirstCol}: ${payerExpenses[idFirstRowSameCol][idSameRowFirstCol].totalExpense}`
						);
					} else {
						console.log(
							`Beneficiary with ID ${idSameRowFirstCol} not found for payer ${idFirstRowSameCol}`
						);
					}
				} else {
					console.log(`Payer with ID ${idFirstRowSameCol} not found`);
				}

				console.log("Updated cell:", tableDataTmp[row][col], row, col);
			}
		}

		console.log("people: ", people);
		console.log("tabledata: ", tableDataTmp);
		setTableData(tableDataTmp);
	}

	async function getData(data) {
		setHistory((prevArray) => [
			...prevArray,
			{ data: data, id: Math.random().toString() },
		]);
	}

	useEffect(() => {
		updateTableData();
	}, [people]);

	useEffect(() => {
		updateTableData();
	}, [history]);

	function startNameInput() {
		setModalIsVisible(true);
	}

	function endNameInput() {
		setModalIsVisible(false);
	}

	const openTransactionModal = () => {
		setTransactionModalIsVisible(true);
	};

	const closeTransactionModal = () => {
		setTransactionModalIsVisible(false);
	};

	function addPerson(newItem) {
		setPeople((prevArray) => [
			...prevArray,
			{ text: newItem, id: Math.random().toString() },
		]);
	}

	function deleteGoalHandler(id) {
		setPeople((prevCourseGoals) => {
			return prevCourseGoals.filter((goal) => goal.id !== id);
		});
	}

	const [fontsLoaded] = useFonts({
		"Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
		"Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
		"Sevillana-Regular": require("./assets/fonts/Sevillana-Regular.ttf"),
		"Rubik-Regular": require("./assets/fonts/RubikDoodleShadow-Regular.ttf"),
	});

	if (!fontsLoaded) {
		return undefined;
	}

	return (
		<>
			<StatusBar style="light" />
			<View style={styles.appContainer}>
				<View style={styles.topBar}>
					<View></View>
					<Text style={styles.title}>Travel Calculator</Text>
					<View style={styles.threeDot}>
						<Button title="⋮" color={"#8a1f56"} onPress={startNameInput} />
					</View>
				</View>

				<SafeAreaView style={styles.peopleTable}>
					<PeopleTable tableData={tableData} />
				</SafeAreaView>

				<PayerExpensesList aggregatedExpenses={sums} />

				{/* History Section */}
				<View style={styles.historyContainer}>
					<Text style={styles.historyTitle}>Transaction History</Text>
					<FlatList
						data={history}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<View style={styles.listItem}>
								<Text style={styles.itemDisplayed}>
									Payer: {item.data.payer.text}
									{"\n"}
									Beneficiaries:{"\n"}
									{item.data.beneficiaries &&
										item.data.beneficiaries.map(
											(beneficiary) =>
												` - ${beneficiary.name}: ${beneficiary.price}\n`
										)}
								</Text>
							</View>
						)}
					/>
				</View>

				{/* + Button to open the transaction modal */}
				<TouchableOpacity
					style={styles.addButton}
					onPress={openTransactionModal}
				>
					<Text style={styles.addButtonText}>+</Text>
				</TouchableOpacity>

				{/* Transaction Input Modal */}
				<TransactionInputModal
					visible={transactionModalIsVisible}
					onClose={closeTransactionModal}
					people={people}
					getData={getData}
					// Add any necessary props for the transaction modal
				/>

				{/* Name Input Modal */}
				<NameInput
					visible={modalIsVisible}
					onBackPress={endNameInput}
					addPerson={addPerson}
					dataArray={people}
					setDataArray={setPeople}
					onDelete={deleteGoalHandler}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	appContainer: {
		flex: 1,
		padding: 50,
		paddingHorizontal: 16,
		backgroundColor: "#3d1425",
	},
	topBar: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	title: {
		textAlign: "center",
		color: "#b03e5a",
		fontSize: 28,
	},
	threeDot: {},
	goalsContainer: {
		flex: 5,
	},
	peopleTable: {
		marginTop: 16,
	},
	itemDisplayed: {
		color: "white",
	},
	historyContainer: {
		marginTop: 20,
	},
	historyTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
		marginBottom: 10,
	},
	addButton: {
		position: "absolute",
		bottom: 20,
		right: 20,
		backgroundColor: "#8a1f56",
		borderRadius: 50,
		width: 50,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	addButtonText: {
		color: "white",
		fontSize: 24,
	},
});
