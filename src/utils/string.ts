function digitOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export { digitOnly };
