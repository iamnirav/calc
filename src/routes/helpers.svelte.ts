import { tick } from 'svelte'
export const operators = ['+', '-', '*', '/']

export function findCursorPosition(event: Event): { startIndex: number, endIndex: number } {
  const selection = window.getSelection()
  if (!selection) return { startIndex: 0, endIndex: 0 }
  
  const target = event.target as HTMLDivElement
  const range = selection.getRangeAt(0)

  const tempRange = range.cloneRange()
  tempRange.setStart(target, 0)

  tempRange.setEnd(range.startContainer, range.startOffset)
  const startIndex = tempRange.toString().length

  tempRange.setEnd(range.endContainer, range.endOffset)
  const endIndex = tempRange.toString().length

  return { startIndex, endIndex }
}

export function findTextNodeAndOffset(
  node: Node,
  targetOffset: number
): { node: Node; offset: number } | null {
  let currentOffset = 0

  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const textLength = child.textContent!.length
      if (currentOffset + textLength >= targetOffset) {
        return { node: child, offset: targetOffset - currentOffset }
      }
      currentOffset += textLength
    } else {
      const result = findTextNodeAndOffset(child, targetOffset - currentOffset)
      if (result) {
        return result
      }
      currentOffset += child.textContent!.length
    }
  }

  return null
}

// UNUSED

export async function formatExpression(event: InputEvent, expression: string) {
    const { inputType, data } = event

    if (!data) return

    if (inputType === 'deleteContentBackward') return

    if (!operators.includes(data)) return

    event.preventDefault()
    const originalExpression = expression

    if (expression[expression.length - 1] !== ' ') {
      expression += ' '
    }

    expression += data
    expression += ' '

    // Restore caret position

    const selection = window.getSelection()
    if (!selection) return

    const target = event.target as HTMLDivElement

    // Calculate cursor position (including newlines)
    const range = selection.getRangeAt(0)
    const tempRange = range.cloneRange()
    tempRange.setStart(target, 0) // Start from beginning of content
    const cursorPosition = tempRange.toString().length

    // Restore caret position after the next tick to ensure DOM is updated
    await tick()
    selection.setPosition(
      target.firstChild,
      cursorPosition + (expression.length - originalExpression.length)
    )
  }