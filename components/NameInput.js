import React, { useState } from "react";
import {
	Modal,
	View,
	Text,
	TextInput,
	Button,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
//{ dataArray, setDataArray, onBack }
const NameInput = (props) => {
	const [newItem, setNewItem] = useState("");
	const addItemToList = () => {
		if (newItem.trim() !== "") {
			console.log("added", newItem);
			props.addPerson(newItem);
			setNewItem("");
		}
	};

	const deleteItem = (id) => {
		props.onDelete(id);
	};

	const renderListItem = ({ item, index }) => (
		<View style={styles.listItem}>
			<Text style={styles.listItemText}>{item.text}</Text>
			<TouchableOpacity onPress={() => deleteItem(item.id)}>
				<Text style={styles.deleteButton}>Delete</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<Modal visible={props.visible} animationType="slide">
			<View style={styles.container}>
				<View style={styles.backButton}>
					<Button title="Back" onPress={props.onBackPress} color="#ca3681" />
				</View>

				<FlatList
					data={props.dataArray}
					renderItem={renderListItem}
					keyExtractor={(item, index) => index.toString()}
					style={styles.list}
				/>
				{/* <FlatList
					data={props.dataArray}
					keyExtractor={(item, index) => {
						return item.id;
					}}
					renderItem={({ item }) => (
						<View>
							<Text>{props.dataArray.text}</Text>
						</View>
					)}
				/> */}

				<TextInput
					style={styles.input}
					placeholderTextColor="#aaa"
					placeholder="Enter item"
					value={newItem}
					onChangeText={(text) => setNewItem(text)}
				/>

				<TouchableOpacity style={styles.addButton} onPress={addItemToList}>
					<Text style={styles.buttonText}>+</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#3d1425",
	},
	input: {
		height: 50,
		width: "85%",
		borderColor: "gray",
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 8,
		color: "white",
	},
	addButton: {
		position: "absolute",
		bottom: 30,
		right: 20,
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#ca3681",
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 24,
	},
	list: {
		marginTop: 60,
		flexGrow: 1,
	},
	listItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "lightgray",
	},
	listItemText: {
		color: "white",
		fontSize: 20,
	},
	deleteButton: {
		color: "red",
	},
	backButton: {
		position: "absolute",
		top: 20,
		left: 10,
		padding: 10,
		flex: 1,
	},
	backButtonText: {
		color: "white",
		fontSize: 16,
	},
});

export default NameInput;
