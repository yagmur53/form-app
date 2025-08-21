import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function DateFilter({ dateName, value, onChange }) {
  return (
    <DatePicker
      label={dateName}
      value={value}
      onChange={onChange}
      format="YYYY-MM-DD"
      slotProps={{
        textField: {
          variant: "outlined",
          size: "small",
          sx: {
            backgroundColor: "#fff",
            borderRadius: "12px",
            height: "40px",
            width: "170px",
            border: "1px solid #fff",

            "& .MuiInputBase-root": {
              height: "40px",
              borderRadius: "12px",
              boxShadow: "none",
              fontSize: "0.7rem",
            },
            "& input": {
              fontSize: "0.65rem",
              padding: "4px 6px",
              textAlign: "center",
              letterSpacing: "0.4px",
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.65rem",
            },
            "& fieldset": {
              border: "none",
            },
          },
        },
      }}
    />
  );
}
