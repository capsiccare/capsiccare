// Converts a number to Indian/International currency words format (e.g., 760 -> "Seven Hundred Sixty Only")

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
]

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
]

function convertLessThanOneThousand(num: number): string {
  let current = ''

  if (num >= 100) {
    current += ones[Math.floor(num / 100)] + ' Hundred '
    num %= 100
  }

  if (num > 0) {
    if (num < 20) {
      current += ones[num] + ' '
    } else {
      current += tens[Math.floor(num / 10)] + ' '
      if (num % 10 > 0) {
        current += ones[num % 10] + ' '
      }
    }
  }

  return current.trim()
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Only'

  const integerPart = Math.floor(Math.abs(num))
  let result = ''

  const crore = Math.floor(integerPart / 10000000)
  let remainder = integerPart % 10000000

  const lakh = Math.floor(remainder / 100000)
  remainder = remainder % 100000

  const thousand = Math.floor(remainder / 1000)
  remainder = remainder % 1000

  if (crore > 0) {
    result += convertLessThanOneThousand(crore) + ' Crore '
  }
  if (lakh > 0) {
    result += convertLessThanOneThousand(lakh) + ' Lakh '
  }
  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + ' Thousand '
  }
  if (remainder > 0) {
    result += convertLessThanOneThousand(remainder) + ' '
  }

  return `${result.trim()} Only`
}
