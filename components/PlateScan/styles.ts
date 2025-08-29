import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    cameraStyle: {
        flex: 1,
    },
    plateScanContainer: {
        flex: 1,
    },
    overlayContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    plateStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 8,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 12,
        textAlign: 'center',
        marginBottom: 16,
        minWidth: 200,
    },
    scanButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    scanButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    clearButton: {
        backgroundColor: '#FF3B30',
    },
    resetButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 20,
    },
});