const formatters: [RegExp | string, string][] = [
  [/[/*+-]/, 'i.operator'],
  [/#.*$/, 'i.comment'],
  [/#/, 'i.hash'],
  [/[()]/, 'i.paren'],
  [/[\D]/, 'i.text'],
]

export function formatExpression(expression: string) {
  return formatters.reduce((exp, [target, tagString]) => {
    const regex = new RegExp(target, 'gm')
    const [tag, className] = tagString.split('.')
    return exp.replaceAll(regex, `<${tag} class="${className}">$&</${tag}>`)
  }, expression)
}
