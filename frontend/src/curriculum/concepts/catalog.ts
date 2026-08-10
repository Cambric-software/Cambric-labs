/**
 * Cambric Labs — Concept Catalog
 *
 * Concepts are language-agnostic units of knowledge (e.g. "variable",
 * "for-loop", "ownership"). They form a directed acyclic graph via
 * prerequisite edges. The adaptive scheduler uses this graph to ensure a
 * learner never meets a concept before its prerequisites.
 *
 * Aliases are used by the semantic-duplicate detector so that, e.g.,
 * "function" and "method" and "procedure" can be recognized as related
 * across languages without false-positive duplicate flags.
 */
import type { Concept } from '../types'

export const CONCEPTS: Concept[] = [
  {
    id: 'program',
    title: 'Program',
    summary: 'A sequence of instructions a computer executes.',
    prerequisiteConceptIds: [],
    aliases: ['code', 'script'],
  },
  {
    id: 'statement',
    title: 'Statement',
    summary: 'A single instruction that performs an action.',
    prerequisiteConceptIds: ['program'],
    aliases: ['instruction'],
  },
  {
    id: 'expression',
    title: 'Expression',
    summary: 'A piece of code that evaluates to a value.',
    prerequisiteConceptIds: ['statement'],
    aliases: ['value-producing code'],
  },
  {
    id: 'variable',
    title: 'Variable',
    summary: 'A named container that stores a value.',
    prerequisiteConceptIds: ['statement'],
    aliases: ['binding', 'name'],
  },
  {
    id: 'assignment',
    title: 'Assignment',
    summary: 'Storing a value into a variable.',
    prerequisiteConceptIds: ['variable'],
    aliases: ['reassignment'],
  },
  {
    id: 'type',
    title: 'Type',
    summary: 'A classification of data that determines valid operations.',
    prerequisiteConceptIds: ['variable'],
    aliases: ['data type'],
  },
  {
    id: 'literal',
    title: 'Literal',
    summary: 'A fixed value written directly in source, e.g. 42 or "hi".',
    prerequisiteConceptIds: ['expression'],
    aliases: ['constant value'],
  },
  {
    id: 'operator',
    title: 'Operator',
    summary: 'A symbol performing an operation on one or more operands.',
    prerequisiteConceptIds: ['expression'],
    aliases: ['operation'],
  },
  {
    id: 'function',
    title: 'Function',
    summary: 'A reusable, named block of code that takes inputs and returns a result.',
    prerequisiteConceptIds: ['variable', 'statement'],
    aliases: ['method', 'procedure', 'subroutine'],
  },
  {
    id: 'parameter',
    title: 'Parameter',
    summary: 'A named input a function accepts.',
    prerequisiteConceptIds: ['function'],
    aliases: ['argument', 'formal parameter'],
  },
  {
    id: 'return-value',
    title: 'Return Value',
    summary: 'The value a function produces back to its caller.',
    prerequisiteConceptIds: ['function'],
    aliases: ['result'],
  },
  {
    id: 'control-flow',
    title: 'Control Flow',
    summary: 'The order in which statements execute.',
    prerequisiteConceptIds: ['statement'],
    aliases: ['flow of control'],
  },
  {
    id: 'conditional',
    title: 'Conditional',
    summary: 'Executing code only when a condition is true.',
    prerequisiteConceptIds: ['control-flow', 'expression'],
    aliases: ['if statement', 'branching'],
  },
  {
    id: 'boolean-logic',
    title: 'Boolean Logic',
    summary: 'Combining true/false values with and, or, not.',
    prerequisiteConceptIds: ['expression'],
    aliases: ['logical operators'],
  },
  {
    id: 'loop',
    title: 'Loop',
    summary: 'Repeating a block of code while a condition holds.',
    prerequisiteConceptIds: ['control-flow'],
    aliases: ['iteration', 'repetition'],
  },
  {
    id: 'for-loop',
    title: 'For Loop',
    summary: 'A loop with an explicit counter over a range or sequence.',
    prerequisiteConceptIds: ['loop'],
    aliases: ['counting loop'],
  },
  {
    id: 'while-loop',
    title: 'While Loop',
    summary: 'A loop repeating while a condition remains true.',
    prerequisiteConceptIds: ['loop'],
    aliases: ['condition loop'],
  },
  {
    id: 'collection',
    title: 'Collection',
    summary: 'A data structure holding multiple values.',
    prerequisiteConceptIds: ['variable', 'type'],
    aliases: ['container'],
  },
  {
    id: 'array',
    title: 'Array',
    summary: 'An indexed, fixed-size sequence of values.',
    prerequisiteConceptIds: ['collection'],
    aliases: ['list', 'vector'],
  },
  {
    id: 'string',
    title: 'String',
    summary: 'A sequence of characters representing text.',
    prerequisiteConceptIds: ['type'],
    aliases: ['text'],
  },
  {
    id: 'scope',
    title: 'Scope',
    summary: 'The region of code where a name is visible.',
    prerequisiteConceptIds: ['variable', 'function'],
    aliases: ['visibility', 'namespace'],
  },
  {
    id: 'recursion',
    title: 'Recursion',
    summary: 'A function calling itself on a smaller subproblem.',
    prerequisiteConceptIds: ['function', 'conditional'],
    aliases: ['self-reference'],
  },
  {
    id: 'mutation',
    title: 'Mutation',
    summary: 'Changing a value or data structure in place.',
    prerequisiteConceptIds: ['assignment'],
    aliases: ['in-place change'],
  },
  {
    id: 'immutability',
    title: 'Immutability',
    summary: 'A value that cannot change after creation.',
    prerequisiteConceptIds: ['mutation'],
    aliases: ['constant data'],
  },
  {
    id: 'object',
    title: 'Object',
    summary: 'A bundle of state (fields) and behavior (methods).',
    prerequisiteConceptIds: ['variable', 'function'],
    aliases: ['instance'],
  },
  {
    id: 'class',
    title: 'Class',
    summary: 'A blueprint defining the fields and methods of objects.',
    prerequisiteConceptIds: ['object', 'type'],
    aliases: ['blueprint'],
  },
  {
    id: 'encapsulation',
    title: 'Encapsulation',
    summary: 'Hiding internal state behind an interface.',
    prerequisiteConceptIds: ['object', 'scope'],
    aliases: ['information hiding'],
  },
  {
    id: 'inheritance',
    title: 'Inheritance',
    summary: 'A class deriving fields and methods from another class.',
    prerequisiteConceptIds: ['class'],
    aliases: ['subclassing'],
  },
  {
    id: 'polymorphism',
    title: 'Polymorphism',
    summary: 'Treating different types through a common interface.',
    prerequisiteConceptIds: ['inheritance'],
    aliases: ['dynamic dispatch'],
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    summary: 'Detecting and responding to failures gracefully.',
    prerequisiteConceptIds: ['control-flow'],
    aliases: ['exceptions', 'try-catch'],
  },
  {
    id: 'memory-model',
    title: 'Memory Model',
    summary: 'How the language allocates and frees memory.',
    prerequisiteConceptIds: ['variable', 'mutation'],
    aliases: ['allocation'],
  },
  {
    id: 'ownership',
    title: 'Ownership',
    summary: 'A discipline where each value has a single owning scope.',
    prerequisiteConceptIds: ['memory-model', 'scope'],
    aliases: ['borrowing', 'lifetimes'],
  },
  {
    id: 'module-system',
    title: 'Module System',
    summary: 'Splitting code into reusable, importable units.',
    prerequisiteConceptIds: ['function', 'scope'],
    aliases: ['packages', 'imports'],
  },
  {
    id: 'testing',
    title: 'Testing',
    summary: 'Verifying code behaves correctly via executable checks.',
    prerequisiteConceptIds: ['function'],
    aliases: ['unit tests'],
  },
  {
    id: 'algorithm',
    title: 'Algorithm',
    summary: 'A precise, finite procedure for solving a problem.',
    prerequisiteConceptIds: ['function', 'control-flow'],
    aliases: ['procedure'],
  },
  {
    id: 'complexity',
    title: 'Computational Complexity',
    summary: 'How runtime/space grow with input size.',
    prerequisiteConceptIds: ['algorithm'],
    aliases: ['big-o', 'time complexity'],
  },
  {
    id: 'data-structure',
    title: 'Data Structure',
    summary: 'An organized way to store and access data.',
    prerequisiteConceptIds: ['collection'],
    aliases: ['container structure'],
  },
  {
    id: 'pointer',
    title: 'Pointer',
    summary: 'A value holding the address of other data.',
    prerequisiteConceptIds: ['memory-model'],
    aliases: ['reference'],
  },
  {
    id: 'map',
    title: 'Map',
    summary: 'A collection of key-to-value associations.',
    prerequisiteConceptIds: ['collection', 'array'],
    aliases: ['dictionary', 'dict', 'hashmap', 'hashtable', 'record'],
  },
  {
    id: 'set',
    title: 'Set',
    summary: 'A collection of unique values with no defined order.',
    prerequisiteConceptIds: ['collection'],
    aliases: ['unique collection'],
  },
  {
    id: 'iteration',
    title: 'Iteration',
    summary: 'Visiting each element of a collection in turn.',
    prerequisiteConceptIds: ['loop', 'collection'],
    aliases: ['traversal', 'enumeration'],
  },
  {
    id: 'index',
    title: 'Index',
    summary: 'A position used to access an element of an ordered collection.',
    prerequisiteConceptIds: ['array'],
    aliases: ['offset', 'position'],
  },
  {
    id: 'string-method',
    title: 'String Method',
    summary: 'An operation that transforms or inspects text.',
    prerequisiteConceptIds: ['string', 'function'],
    aliases: ['text operation'],
  },
]

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((concept) => [concept.id, concept]),
)

export function getConcept(id: string): Concept | undefined {
  return CONCEPT_BY_ID[id]
}

export function listConcepts(): Concept[] {
  return CONCEPTS
}
