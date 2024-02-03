import { useState, useEffect } from "react";
import {
	AsyncStorage,
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
	const [tableData, setTableData] = useState([]);
	const [debts, setDebts] = useState([]);

	//TODO
	//create an empty list
	//create a setter (just like addPerson)
	//prevArray + {payer, [list], id}
	//this list should be created in TIM
	//list = list(ben,price)
	//store payer and ben as id
	//+create a deleter

	// Load data from AsyncStorage on app start
	useEffect(() => {
		const loadData = async () => {
			try {
				const storedPeople = await AsyncStorage.getItem("@people");
				const storedHistory = await AsyncStorage.getItem("@history");

				if (storedPeople) {
					setPeople(JSON.parse(storedPeople));
				}

				if (storedHistory) {
					setHistory(JSON.parse(storedHistory));
				}
			} catch (error) {
				console.error("Error loading data from AsyncStorage:", error);
			}
		};

		loadData();
	}, []);

	// Save data to AsyncStorage when people or history state changes
	useEffect(() => {
		const saveData = async () => {
			try {
				await AsyncStorage.setItem("@people", JSON.stringify(people));
				await AsyncStorage.setItem("@history", JSON.stringify(history));
			} catch (error) {
				console.error("Error saving data to AsyncStorage:", error);
			}
		};

		saveData();
	}, [people, history]);

	function updateTableData() {
		setDebts([]);
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
				const priceFloat = parseFloat(price); // lets hope TransactionInput.handlePriceInput inputed a valid price in float
				//todo handle possible error here. Throw error code or smth

				payerExpenses[payer][id].totalExpense += parseFloat(price);
				payerExpenses[payer][id].totalExpense = parseFloat(
					payerExpenses[payer][id].totalExpense
				);
			});
		});

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
			for (let col = row; col < tableDataTmp[row].length; col++) {
				const idFirstRowSameCol = tableDataTmp[0][col].id;
				const idSameRowFirstCol = tableDataTmp[row][0].id;
				let payout = 0;
				// Check if the payer exists in the payerExpenses object
				if (payerExpenses[idFirstRowSameCol]) {
					// Check if the beneficiary exists for the specified payer
					if (payerExpenses[idFirstRowSameCol][idSameRowFirstCol]) {
						// Access the totalExpense for the specified payer and beneficiary
						//console.log("theoretical expense: ",payerExpenses[idFirstRowSameCol][idSameRowFirstCol].totalExpense);

						payout =
							payerExpenses[idFirstRowSameCol][idSameRowFirstCol].totalExpense;

						//console.log("tabledata: ", tableDataTmp);

						// Now 'totalExpense' contains the total expense for the specified payer and beneficiary
						// totalExpence here not working because it doesn't exist
						//console.log(`Total expense for payer ${idFirstRowSameCol} and beneficiary ${idSameRowFirstCol}: ${payerExpenses[idFirstRowSameCol][idSameRowFirstCol].totalExpense}`);
					} else {
						//console.log(`Beneficiary with ID ${idSameRowFirstCol} not found for payer ${idFirstRowSameCol}`);
					}
				} else {
					//console.log(`Payer with ID ${idFirstRowSameCol} not found`);
				}
				if (idSameRowFirstCol !== idFirstRowSameCol) {
					if (payerExpenses[idSameRowFirstCol]) {
						if (payerExpenses[idSameRowFirstCol][idFirstRowSameCol]) {
							// console.log(
							// 	"payer expences: ",
							// 	payerExpenses[idSameRowFirstCol][idFirstRowSameCol].totalExpense
							// );
							payout =
								payout -
								payerExpenses[idSameRowFirstCol][idFirstRowSameCol]
									.totalExpense;
							// console.log("second payout: ", payout);
						}
					}
				}

				//console.log("Updated cell:", tableDataTmp[row][col], row, col);
				if (payout !== 0) {
					makeInvoice(payout, idSameRowFirstCol, idFirstRowSameCol);
				}
				tableDataTmp[row][col].text = payout;
			}
		}

		//console.log("people: ", people);
		//console.log("tabledata: ", tableDataTmp);
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

	function getPersonNameById(personId) {
		const person = people.find((p) => p.id === personId);
		return person ? person.text : "Error4";
	}

	function makeInvoice(price, idDebtor, idLender) {
		let debtorName = getPersonNameById(idDebtor);
		let lenderName = getPersonNameById(idLender);
		if (debtorName != lenderName) {
			//let line;
			if (price < 0) {
				price = -price;
				//line = `${lenderName} owes ${debtorName} ${price}€`;\
				addRelation(price, lenderName, debtorName, idLender, idDebtor);
			} else {
				//line = `${debtorName} owes ${lenderName} ${price}€`;
				addRelation(price, debtorName, lenderName, idDebtor, idLender);
			}
		}
	}

	function addRelation(price, debtorName, lenderName, idDebtor, idLender) {
		setDebts((prevArray) => [
			...prevArray,
			{
				price: price,
				debtorName: debtorName,
				lenderName: lenderName,
				idDebtor: idDebtor,
				idLender: idLender,
				id: Math.random().toString(),
			},
		]);
	}

	function addPerson(newItem) {
		setPeople((prevArray) => [
			...prevArray,
			{ text: newItem, id: Math.random().toString() },
		]);
	}

	function deletePerson(id) {
		setPeople((prevList) => {
			return prevList.filter((goal) => goal.id !== id);
		});
	}

	function deleteHistoryItem(id) {
		setHistory((prevList) => {
			return prevList.filter((goal) => goal.id !== id);
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

	const dateFormatter = new Intl.DateTimeFormat("en-US", {
		year: "2-digit",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	});

	const renderRelation = ({ item }) => (
		<View key={item.id} style={styles.listItem}>
			<Text style={styles.itemDisplayed}>
				{item.debtorName} owes {item.lenderName} {item.price}€
			</Text>
			{/* {item.text} */}
		</View>
	);

	return (
		<>
			<StatusBar style="light" />
			<View style={styles.appContainer}>
				<View style={styles.topBar}>
					<View></View>
					<Text style={styles.title}>Splitwise</Text>
					<View style={styles.threeDot}>
						<Button title="⋮" color={"#db0e52"} onPress={startNameInput} />
					</View>
				</View>

				<SafeAreaView style={styles.peopleTable}>
					<PeopleTable tableData={tableData} />
				</SafeAreaView>

				{/* FlatList for tableData */}
				<View style={styles.container}>
					<View style={styles.halfContainer}>
						<FlatList
							data={debts}
							keyExtractor={(item) => item.id}
							renderItem={renderRelation}
						/>
					</View>

					{/* <PayerExpensesList aggregatedExpenses={sums} />

				{/* History Section */}
					<View style={styles.halfContainer}>
						<Text style={styles.historyTitle}>Transaction History</Text>
						<FlatList
							data={history}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<View style={styles.listItem}>
									<Text style={styles.itemDisplayed}>
										Payer: {item.data.payer.text} {"             "}Description:{" "}
										{item.data.description}
										{"\n"}
										Date: {dateFormatter.format(item.data.time)}
										{"\n"}
										Beneficiaries:{"\n"}
										{item.data.beneficiaries &&
											item.data.beneficiaries.map(
												(beneficiary) =>
													` - ${beneficiary.name}: ${beneficiary.price}\n`
											)}
									</Text>
									<TouchableOpacity onPress={() => deleteHistoryItem(item.id)}>
										<Text style={styles.deleteButton}>Delete</Text>
									</TouchableOpacity>
								</View>
							)}
						/>
					</View>
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
					debts={debts}
					// Add any necessary props for the transaction modal
				/>

				{/* Name Input Modal */}
				<NameInput
					visible={modalIsVisible}
					onBackPress={endNameInput}
					addPerson={addPerson}
					dataArray={people}
					setDataArray={setPeople}
					onDelete={deletePerson}
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
		backgroundColor: "#191538",
	},
	topBar: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	title: {
		textAlign: "center",
		color: "#db0e52",
		fontSize: 28,
	},
	threeDot: {
		marginTop: 1,
	},
	peopleTable: {
		marginTop: 16,
	},
	itemDisplayed: {
		color: "white",
	},
	historyContainer: {
		marginTop: 20,
		flex: 1,
	},
	container: {
		flex: 1,
		flexDirection: "column", // Arrange children in a row
	},
	halfContainer: {
		flex: 1, // Each FlatList takes up half of the available space
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
		backgroundColor: "#db0e52",
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
	listItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "lightgray",
	},
	deleteButton: {
		color: "red",
	},
});
