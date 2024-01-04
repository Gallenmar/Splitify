import React, { useState } from "react";
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

const TransactionInputModal = ({ visible, onClose, people, getData }) => {
	const [selectedPayer, setSelectedPayer] = useState(null);
	const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);

	const [totalSum, setTotalSum] = useState(0);
	const [prices, setPrices] = useState({});

	const handlePayerSelection = (payer) => {
		setSelectedPayer(payer);
	};

	const handleBeneficiarySelection = (beneficiary) => {
		const updatedBeneficiaries = selectedBeneficiaries.includes(beneficiary)
			? selectedBeneficiaries.filter((item) => item !== beneficiary)
			: [...selectedBeneficiaries, beneficiary];

		setSelectedBeneficiaries(updatedBeneficiaries);
	};

	const handlePriceInput = (beneficiary, price, getData) => {
		setPrices((prevPrices) => ({ ...prevPrices, [beneficiary.id]: price }));
	};

	const calculateTotalSum = () => {
		let sum = 0;
		for (const beneficiary of selectedBeneficiaries) {
			const price = prices[beneficiary.id] || 0;
			sum += parseFloat(price);
		}
		setTotalSum(sum);
	};

	const handleDone = () => {
		const result = {
			payer: selectedPayer,
			beneficiaries: selectedBeneficiaries.map((beneficiary) => ({
				id: beneficiary.id,
				name: beneficiary.text,
				price: prices[beneficiary.id] || 0,
			})),
		};
		getData(result);

		setSelectedPayer(null);
		setSelectedBeneficiaries([]);
		setPrices({});
		setTotalSum(0);
		// Close the modal
		onClose();
	};

	const handleClose = () => {
		setSelectedPayer(null);
		setSelectedBeneficiaries([]);
		setPrices({});
		setTotalSum(0);

		onClose();
	};

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.modalContainer}>
				{/* Back Button */}
				<TouchableOpacity onPress={handleClose} style={styles.backButton}>
					<Text style={{ color: "white" }}>Back</Text>
				</TouchableOpacity>

				<Text style={styles.totalSum}>{`Total: ${totalSum.toFixed(2)}`}</Text>

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
								<Text>{item.text}</Text>
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
									selectedBeneficiaries.includes(item) && styles.selectedPerson,
								]}
								onPress={() => handleBeneficiarySelection(item)}
							>
								<Text>{item.text}</Text>
							</TouchableOpacity>
						)}
					/>
				</View>

				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>Prices</Text>
					{selectedBeneficiaries.map((beneficiary) => (
						<View key={beneficiary.id} style={styles.priceInputContainer}>
							<Text>{beneficiary.text}</Text>
							<TextInput
								style={styles.priceInput}
								keyboardType="numeric"
								placeholder="Enter price"
								onChangeText={(text) => handlePriceInput(beneficiary, text)}
								onBlur={calculateTotalSum}
							/>
						</View>
					))}
				</View>

				<Button title="Done" onPress={handleDone} />
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: "white",
	},
	totalSum: {
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	sectionContainer: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
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
	priceInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	priceInput: {
		flex: 1,
		marginLeft: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		padding: 8,
	},
	backButton: {
		position: "absolute",
		top: 20,
		left: 20,
		zIndex: 1,
		padding: 10,
		backgroundColor: "#8a1f56",
		borderRadius: 5,
	},
});

export default TransactionInputModal;
