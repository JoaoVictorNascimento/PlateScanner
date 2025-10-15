import { StyleSheet } from "react-native";
import { DefaultTheme, Typography } from "@moov/ds";
import styled from "styled-components/native";

export const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  cameraStyle: {
    flex: 1,
  },
  clearButton: {
    backgroundColor: 'red',
  },
  loadingContainer: {
    alignItems: "center",
    backgroundColor: 'black',
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: "bold",
    padding: 20,
    textAlign: "center",
  },
  overlayContainer: {
    backgroundColor: 'black',
    height: "100%",
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  plateMessage: {
    backgroundColor: 'black',
    borderRadius: 8,
    color: DefaultTheme.colors.white,
    fontSize: 18,
    marginBottom: 16,
    padding: 12,
    textAlign: "center",
  },
  plateScanContainer: {
    flex: 1,
  },
  scanButton: {
    backgroundColor: 'blue',
    borderRadius: 8,
    elevation: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: 'black',
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
    fontWeight: "bold",
    textAlign: "center",
  },
});

export const PlateMessage = styled(Typography).attrs((props) => {
  return {
    size: props.theme.fontSizes.M,
    weight: props.theme.fontWeight.normal,
    color: props.theme.colors.gray.contrast,
    ...props,
  };
})`
  line-height: 24px;
`;
