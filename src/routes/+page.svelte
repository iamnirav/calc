<script lang="ts">
  import { evaluate } from 'mathjs'
  import { tick } from 'svelte'
  import { formatExpression } from './formatter.svelte'
  import { findCursorPosition, findTextNodeAndOffset } from './helpers.svelte'

  let rawExpression = $state('')
  let formattedExpression = $derived.by(() => formatExpression(rawExpression))

  let result = $derived.by(() => {
    // Remove comments and newlines
    const cleaned = rawExpression.replaceAll(/(#.*)?\n/g, ' ')
    try {
      return evaluate(cleaned)
    } catch (error) {
      return '...'
    }
  })

  let lineResults = $derived.by(() => {
    return rawExpression.split('\n').map((line) => {
      // Remove trailing operators and comments
      const cleaned = line.replace(/ *[+\-*/]? *(#.*)?$/, '')
      try {
        return evaluate(cleaned)
      } catch (error) {
        return '...'
      }
    })
  })

  async function onbeforeinput(event: Event) {
    if ((event as InputEvent).data !== '(') {
      return
    }

    const target = event.target as HTMLDivElement
    const { startIndex, endIndex } = findCursorPosition(event)
    let offset = 0

    rawExpression =
      rawExpression.slice(0, startIndex) +
      '(' +
      rawExpression.slice(startIndex, endIndex) +
      ')' +
      rawExpression.slice(endIndex)

    offset += 1

    event.preventDefault()

    // Restore selection after the next tick
    await tick()

    const startPosition = findTextNodeAndOffset(target, startIndex + offset)
    const endPosition = findTextNodeAndOffset(target, endIndex + offset)

    if (startPosition && endPosition) {
      const selection = window.getSelection()
      if (selection) {
        selection.setPosition(startPosition.node, startPosition.offset)
        selection.extend(endPosition.node, endPosition.offset)
      }
    }
  }

  // Save textContent into rawExpression and restore cursor position
  // after expression is formatted
  // This function isn't called if we preventDefault in onbeforeinput
  async function oninput(event: Event) {
    const target = event.target as HTMLDivElement
    rawExpression = target.textContent || ''

    // Save cursor position
    const { startIndex } = findCursorPosition(event)

    // Restore cursor position after the next tick
    await tick()

    const startPosition = findTextNodeAndOffset(target, startIndex)

    if (startPosition) {
      const selection = window.getSelection()
      if (selection) {
        selection.setPosition(startPosition.node, startPosition.offset)
      }
    }
  }
</script>

<h1>calc</h1>
<div class="container">
  <div
    class="expression"
    contenteditable="plaintext-only"
    {oninput}
    {onbeforeinput}
    bind:innerHTML={formattedExpression}
  ></div>
  <div class="line-results">
    {#each lineResults as lineResult}
      <div>{lineResult}</div>
    {/each}
  </div>
</div>
<div class="final-result">{result}</div>

<style>
  h1 {
    text-align: center;
    color: #666;
    font-family: monospace;
  }

  .container {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .expression,
  .line-results {
    padding: 1rem;
    font-family: monospace;
    font-size: 1rem;
    width: 400px;
    box-sizing: border-box;
  }

  .expression {
    border-right: 2px solid #666;
    border-bottom: 2px solid #666;
    &:focus {
      outline: none;
    }
  }

  .line-results {
    color: #777;
  }

  .final-result {
    padding: 1rem;
    font-family: monospace;
    font-size: 1.5rem;
    width: 800px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  :global(.operator) {
    color: #7474d9;
    display: inline-block;
    padding: 0 0.25rem;
  }

  :global(.comment) {
    color: rgb(120, 195, 120);
    font-style: italic;
  }

  :global(.hash) {
    display: inline-block;
    padding: 0 0.5rem 0 0.5rem;
  }

  :global(.paren) {
    color: #d9d274;
  }

  :global(.text) {
    color: #d97474;
  }

  :global(body) {
    background-color: #000;
    color: #ddd;
  }

  :global(i) {
    font-style: normal;
  }
</style>
