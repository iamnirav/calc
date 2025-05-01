const formatters: [RegExp | string, string][] = [
  [/[/*+-]/, 'i.operator'],
  [/#.*$/, 'i.comment'],
  [/#/, 'i.hash'],
  [/[()]/, 'i.paren'],
  [/(?<!<[^>]*)[a-zA-Z]+(?![^<]*>)/, 'i.text'], // match text that is not inside tags
]

export function formatExpression(expression: string) {
  return formatters.reduce((exp, [target, tagString]) => {
    const regex = new RegExp(target, 'gm')
    const [tag, className] = tagString.split('.')
    return exp.replaceAll(regex, `<${tag} class="${className}">$&</${tag}>`)
  }, expression)
}
