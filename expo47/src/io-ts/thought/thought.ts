import * as T from "io-ts"
import { setFromArray, DateFromISOString } from "io-ts-types"
import * as Distortion from "../distortion"
import { v4 as uuidv4 } from "uuid"
import { VERSION } from './persist'

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const Thought = T.type(
  {
    v: T.literal(VERSION),
    automaticThought: T.string,
    alternativeThought: T.string,
    cognitiveDistortions: setFromArray(Distortion.Codec, Distortion.ord),
    challenge: T.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    uuid: ID,
  },
  "Thought"
)
export type Thought = T.TypeOf<typeof Thought>

export interface CreateArgs {
  automaticThought: string
  alternativeThought: string
  cognitiveDistortions: Iterable<Distortion.Distortion | string>
  challenge: string
}
export const THOUGHTS_KEY_PREFIX = `@Quirk:thoughts:`
export function getThoughtKey(info: string): string {
  return `${THOUGHTS_KEY_PREFIX}${info}`
}

export function create(args: CreateArgs): Thought {
  const cognitiveDistortions = new Set(
    Array.from(args.cognitiveDistortions).map((name) => {
      const d = typeof name === "string" ? Distortion.bySlug[name] : name
      if (!d) {
        throw new Error(`no such distortion: ${name}`)
      }
      return d
    })
  )
  return {
    ...args,
    cognitiveDistortions,
    uuid: getThoughtKey(uuidv4()),
    createdAt: new Date(),
    updatedAt: new Date(),
    v: VERSION,
  }
}