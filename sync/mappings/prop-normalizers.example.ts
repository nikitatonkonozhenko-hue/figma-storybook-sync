export function normalizeVariantAxis(
  axisName: string,
  axisValue: string
): string {
  const name = axisName.trim().toLowerCase();
  const value = axisValue.trim();

  if (name === "size") {
    if (value === "Small") return "sm";
    if (value === "Medium") return "md";
    if (value === "Large") return "lg";
  }

  return value.toLowerCase();
}
