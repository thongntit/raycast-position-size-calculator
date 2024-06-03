import { ActionPanel, Form, Action, showToast, Toast, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";

export default function Command() {
  const [accountSize, setAccountSize] = useState<string>("");
  const [riskPercentage, setRiskPercentage] = useState<string>("");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [stopLossPrice, setStopLossPrice] = useState<string>("");
  const [isJPY, setIsJPY] = useState<boolean>(false);
  const [positionSize, setPositionSize] = useState<number>(0);

  useEffect(() => {
    const loadSavedValues = async () => {
      const savedAccountSize = await LocalStorage.getItem<string>("accountSize");
      if (savedAccountSize) {
        setAccountSize(savedAccountSize);
      }

      const savedRiskPercentage = await LocalStorage.getItem<string>("riskPercentage");
      if (savedRiskPercentage) {
        setRiskPercentage(savedRiskPercentage);
      }
    };
    if (!accountSize && !riskPercentage) {
      loadSavedValues();
    }
  });

  const saveValues = async () => {
    await LocalStorage.setItem("accountSize", accountSize?.toString());
    await LocalStorage.setItem("riskPercentage", riskPercentage?.toString());
  };

  const calculatePositionSize = () => {
    try {
      const pipValue = isJPY ? 0.01 : 0.0001;

      const account = parseFloat(accountSize);
      const risk = parseFloat(riskPercentage);
      const entry = parseFloat(entryPrice);
      const stoploss = parseFloat(stopLossPrice);

      if (isNaN(account) || isNaN(risk) || isNaN(entry) || isNaN(stoploss)) {
        showToast(Toast.Style.Failure, "Invalid input", "Please enter valid numbers");
        return;
      }
      const stopLossInPip = Math.abs(entry - stoploss) / pipValue;

      const riskAmount = account * (risk / 100);
      const positionSizeInLots = riskAmount / stopLossInPip / 10;
      setPositionSize(positionSizeInLots);
      showToast(
        Toast.Style.Success,
        "Position Size Calculated",
        `Position Size: pip ${positionSizeInLots.toFixed(2)} units`,
      );

      saveValues();
    } catch (error) {
      showToast(Toast.Style.Failure, "Error", "An error occurred during calculation.");
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Calculate" onAction={calculatePositionSize} />
        </ActionPanel>
      }
    >
      <Form.TextField id="accountSize" title="Account Size" value={accountSize} onChange={setAccountSize} />
      <Form.TextField id="riskPercentage" title="Risk Percentage" value={riskPercentage} onChange={setRiskPercentage} />
      <Form.Separator />
      <Form.Checkbox id="isJPY" label="Is JPY Pair?" value={isJPY} onChange={setIsJPY} />
      <Form.TextField id="entryPrice" title="Entry Price" value={entryPrice} onChange={setEntryPrice} />
      <Form.TextField id="stopLossPrice" title="Stop Loss Price" value={stopLossPrice} onChange={setStopLossPrice} />
      {positionSize && (
        <>
          <Form.Separator />
          <Form.Description title="Your position size is:" text={positionSize?.toFixed(2)} />
        </>
      )}
    </Form>
  );
}
