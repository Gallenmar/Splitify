import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	TextInput,
	Button,
	FlatList,
	StyleSheet,
} from "react-native";

const TransactionInputModal = ({
	visible,
	onClose,
	people,
	getData,
	debts,
}) => {
	const [selectedPayer, setSelectedPayer] = useState(null);
	const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
	const [totalSum, setTotalSum] = useState(0);
	const [prices, setPrices] = useState({});
	const [description, setDescription] = useState("");
	const [isTotalSumInput, setIsTotalSumInput] = useState(true);
	const [pricePlaceholder, setPricePlaceholder] = useState(0);
	const [writtenPrice, setWrittenPrice] = useState(0);
	const [errorMessage, setErrorMessage] = useState("");

	const handlePayerSelection = (payer) => {
		setSelectedPayer(payer);
	};

	const handleBeneficiarySelection = (beneficiary) => {
		const updatedBeneficiaries = selectedBeneficiaries.includes(beneficiary)
			? selectedBeneficiaries.filter((item) => item !== beneficiary)
			: [...selectedBeneficiaries, beneficiary];

		//setPrices({});
		setSelectedBeneficiaries(updatedBeneficiaries);
	};

	const handlePriceInput = (beneficiary, price, getData) => {
		// console.log("price is ", price);
		// console.log(typeof price);
		// const priceInt = parseInt(price);
		// console.log("Integer price is ", priceInt);
		// console.log(typeof priceInt);

		const priceRegex = /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/;

		if (!priceRegex.test(price)) {
			//console.log("Invalid price input");
			//return; // Exit the function if the input is invalid
			// todo create a handle for invalid price input
			setPrices((prevPrices) => ({
				...prevPrices,
				//[beneficiary.id]: price,
				[beneficiary.id]: price,
			}));
			//setErrorMessage("One of the prices entered is not a valid format.");
		} else {
			//setErrorMessage("");
			// Remove commas and convert to a float with two decimal places
			const priceFloat = parseFloat(price.replace(/,/g, ""));
			const roundedPrice = Math.round(priceFloat * 100) / 100; // Round to two decimal places

			//console.log("Processed price is ", roundedPrice);
			//console.log(typeof roundedPrice);

			setPrices((prevPrices) => ({
				...prevPrices,
				//[beneficiary.id]: price,
				[beneficiary.id]: roundedPrice,
			}));
			setIsTotalSumInput(false);
		}
	};

	const calculateTotalSum = () => {
		let sum = 0;
		for (const beneficiary of selectedBeneficiaries) {
			const price = prices[beneficiary.id] || 0;
			sum += parseFloat(price);
			//console.log("price variable: ", price);
		}
		setTotalSum(sum);
	};

	useEffect(() => {
		calculateTotalSum();
		console.log("prices: ", prices);
	}, [prices]);

	const currentDate = new Date();

	const handleDone = () => {
		if (!selectedPayer && selectedBeneficiaries.length === 0) {
			// Handle close without initializing result
			//console.log("There is nothing to add");
			handleClose();
			return; // Exit the function early
		}
		const priceRegex = /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/;
		for (const itemId in prices) {
			console.log("all the prices: ", prices[itemId]);
			if (!priceRegex.test(prices[itemId])) {
				console.log("here here");
				setErrorMessage("One of the prices entered is not a valid format.");
				return;
			}
		}

		if (!selectedPayer) {
			setErrorMessage("Selected payer is empty. Cannot proceed.");
			//handleClose();
			return; // Exit the function early
		}
		if (selectedBeneficiaries.length === 0) {
			setErrorMessage("Selected beneficiaries are empty. Cannot proceed.");
			//handleClose();
			return; // Exit the function early
		}

		const result = {
			time: currentDate,
			description: description,
			payer: selectedPayer,
			beneficiaries: selectedBeneficiaries.map((beneficiary) => ({
				id: beneficiary.id,
				name: beneficiary.text,
				price: prices[beneficiary.id] || 0,
			})),
		};
		getData(result);

		handleClose();
	};

	const handleClose = () => {
		setSelectedPayer(null);
		setSelectedBeneficiaries([]);
		setPrices({});
		setTotalSum(0);
		setDescription("");
		setPricePlaceholder(0);
		setIsTotalSumInput(true);
		setWrittenPrice(0);
		setErrorMessage("");

		onClose();
	};

	const renderPriceInputField = ({ item }) => (
		<View key={item.id} style={styles.priceInputContainer}>
			<Text style={styles.text}>{item.text}</Text>
			<TextInput
				value={String(prices[item.id])}
				style={styles.priceInput}
				keyboardType="numeric"
				placeholder="Enter price"
				placeholderTextColor="grey"
				onChangeText={(text) => handlePriceInput(item, text)}
			/>
		</View>
	);

	const handleDescriptionInput = (text) => {
		setDescription(text);
	};

	const handleTotalSumChange = (text) => {
		setWrittenPrice(text);
	};

	useEffect(() => {
		if (isTotalSumInput) {
			console.log(parseFloat(writtenPrice));
			let updatedPrices = {};
			if (!isNaN(parseFloat(writtenPrice))) {
				console.log("here2");
				const equalPrice =
					parseFloat(writtenPrice) / selectedBeneficiaries.length;

				updatedPrices = {};
				let sum = 0;
				selectedBeneficiaries.forEach((beneficiary, index) => {
					if (index === selectedBeneficiaries.length - 1) {
						// Manipulate the last item differently
						// Your custom logic for the last item goes here
						// For example, you can do something like:
						const lastItemPrice = parseFloat(writtenPrice) - sum; // Adjust this according to your needs
						updatedPrices[beneficiary.id] = lastItemPrice.toFixed(2);
					} else {
						// For other items, use the standard equalPrice
						sum = sum + Number(equalPrice.toFixed(2));
						updatedPrices[beneficiary.id] = equalPrice.toFixed(2);
					}
				});
				//console.log("here4: ", updatedPrices);
			} else {
				const equalPrice = 0;
				updatedPrices = {};
				selectedBeneficiaries.forEach((beneficiary, index) => {
					updatedPrices[beneficiary.id] = equalPrice.toFixed(2);
				});
			}
			setPrices(updatedPrices);
		}
	}, [writtenPrice, selectedBeneficiaries]);

	const handleEqualDivisionToggle = () => {
		setIsTotalSumInput((prevIsTotalSumInput) => !prevIsTotalSumInput);
		setPricePlaceholder(totalSum);
	};

	function findTheirDebt(personId) {
		if (selectedPayer) {
			const debt = debts.find(
				(p) => p.idDebtor === personId && p.idLender === selectedPayer.id
			);
			if (debt) {
				return "owes already " + debt.price;
			} else {
				const debt = debts.find(
					(p) => p.idLender === personId && p.idDebtor === selectedPayer.id
				);
				return debt ? "is owed " + debt.price : "";
			}
			//return debt ? "owes already " + debt.price : "";
		} else {
			return "";
		}
	}

	const renderErrorMessage = () => {
		return (
			<View style={styles.errorMessageContainer}>
				<Text style={styles.errorMessageText}>{errorMessage}</Text>
			</View>
		);
	};

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.modalContainer}>
				<View style={styles.topContainer}>
					<TouchableOpacity onPress={handleClose} style={styles.backButton}>
						<Text style={{ color: "white" }}>Back</Text>
					</TouchableOpacity>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.textInput}
							placeholder="Type a description..."
							placeholderTextColor="grey"
							onChangeText={(text) => handleDescriptionInput(text)}
						/>
					</View>
				</View>
				<View style={styles.rowContainer}>
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Payer</Text>
						<FlatList
							data={people}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[
										styles.personButton,
										selectedPayer?.id === item.id && styles.selectedPerson,
									]}
									onPress={() => handlePayerSelection(item)}
								>
									<Text style={styles.text}>{item.text}</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Beneficiaries</Text>
						<FlatList
							data={people}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[
										styles.personButton,
										selectedBeneficiaries.includes(item) &&
											styles.selectedPerson,
									]}
									onPress={() => handleBeneficiarySelection(item)}
								>
									<Text style={styles.text}>
										{item.text} {findTheirDebt(item.id)}
									</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
				</View>
				<View style={styles.sectionContainer}>
					<View style={styles.pricesHat}>
						<Text style={styles.sectionTitle}>Prices</Text>

						{isTotalSumInput ? (
							<>
								<TextInput
									style={styles.totalSumInput}
									placeholder={`Total: ${pricePlaceholder.toFixed(2)}`}
									placeholderTextColor="grey"
									onChangeText={handleTotalSumChange}
									keyboardType="numeric"
								/>
								<TouchableOpacity
									style={styles.equalDivisionToggle}
									onPress={handleEqualDivisionToggle}
								>
									<Text style={styles.equalDivisionToggleText}>✎</Text>
								</TouchableOpacity>
							</>
						) : (
							<>
								<Text style={styles.totalSum}>{`Total: ${totalSum}`}</Text>
								<TouchableOpacity
									style={styles.equalDivisionToggle}
									onPress={handleEqualDivisionToggle}
								>
									<Text style={styles.equalDivisionToggleText}>=</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
					<FlatList
						data={selectedBeneficiaries}
						renderItem={renderPriceInputField}
						keyExtractor={(item) => item.id.toString()}
					/>
				</View>
				<Button title="Done" onPress={handleDone} />
				{errorMessage && renderErrorMessage()}
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#191538",
	},
	topContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
	},
	backButton: {
		flex: 1,
		position: "absolute",
		zIndex: 1,
		padding: 10,
		backgroundColor: "#db0e52",
		borderRadius: 5,
	},
	inputContainer: {
		flex: 1,
		alignItems: "center",
	},
	textInput: {
		color: "white",
		width: "60%",
		height: 40,
		borderColor: "gray",
		borderBottomWidth: 1,
		textAlign: "center",
	},
	rowContainer: {
		flex: 1,
		flexDirection: "row",
	},
	sectionContainer: {
		marginBottom: 20,
		flex: 1,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 5,
		color: "white",
	},
	personButton: {
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginBottom: 5,
	},
	selectedPerson: {
		backgroundColor: "#8a1f56",
		borderColor: "#8a1f56",
		color: "white",
	},
	text: {
		color: "white",
	},
	priceInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	pricesHat: {
		flexDirection: "row",
		alignItems: "center",
	},
	totalSum: {
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "right",
		color: "white",
		marginLeft: "auto",
	},
	priceInput: {
		flex: 1,
		marginLeft: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		padding: 8,
		color: "white",
	},
	totalSumInput: {
		//flex: 1,
		width: "40%",
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		marginTop: 8,
		paddingLeft: 8,
		textAlign: "center",
		color: "white",
	},
	equalDivisionToggle: {
		marginLeft: "auto",
		padding: 8,
		backgroundColor: "#db0e52",
		borderRadius: 5,
	},
	equalDivisionToggleText: {
		color: "white",
	},
	errorMessageContainer: {
		position: "absolute",
		bottom: 60, // Adjust the distance from the bottom as needed
		left: 0,
		right: 0,
		backgroundColor: "red", // Adjust the background color
		paddingVertical: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	errorMessageText: {
		color: "white",
		fontSize: 16,
	},
});

export default TransactionInputModal;
