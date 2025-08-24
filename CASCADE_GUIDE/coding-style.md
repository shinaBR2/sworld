Here are first principles

## Function Syntax (MANDATORY)
- **NEVER** use `function xxx` declarations
- **ALWAYS** use `const xxx = () =>` arrow function syntax
- **NEVER** use classes - functions can do everything classes can do


## Destructuring Standards (CRITICAL)
- **ALWAYS** destructure function parameters at the first line of every function
- **NEVER** use object references like `params.propertyName` throughout the function
- **ALWAYS** destructure nested objects to avoid repeated object access


```typescript
// ✅ GOOD - Destructure at first line
const createAudienceIntelligence = async (params) => {
  const { audienceName, audienceDescription, userId, organizationId } = params
  console.log(audienceName, userId)
  return { result: audienceDescription }
}


// ❌ BAD - Using object references
const createAudienceIntelligence = async (params) => {
  console.log(params.audienceName, params.userId)
  return { result: params.audienceDescription }
}
```


## Export Pattern (MANDATORY)
- **ONE** single export statement at the end of each file
- **NEVER** use multiple `export` statements scattered throughout the file


```typescript
// ✅ GOOD - Single export at end
const func1 = () => {}
const func2 = () => {}
const MyType = {}


export { func1, func2, type MyType }


// ❌ BAD - Multiple exports throughout file
export const func1 = () => {}
export const func2 = () => {}
```
