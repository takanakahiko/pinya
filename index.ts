import { TwitterApi } from 'twitter-api-v2'
import { Status } from 'twitter-d'

// twit と同じ v1.1 のエンドポイント（api.twitter.com）を呼ぶ
const API_V1_1_ROOT = 'https://api.twitter.com/1.1/'

// twit が付けていたヘッダーをそのまま付ける
const headers = () => ({
  'accept': '*/*',
  'user-agent': 'twit-client',
  'content-type': 'application/json',
})

export default class TwitterUtil {
  private twitter: TwitterApi

  constructor() {
    const tokens = {
      appKey: process.env.CONSUMER_KEY || '',
      appSecret: process.env.CONSUMER_SECRET || '',
      accessToken: process.env.ACCESS_TOKEN || '',
      accessSecret: process.env.ACCESS_TOKEN_SECRET || '',
    }
    // twit はキーが空のとき、リクエストを送る前にエラーにしていた
    const names: { [K in keyof typeof tokens]: string } = {
      appKey: 'consumer_key',
      appSecret: 'consumer_secret',
      accessToken: 'access_token',
      accessSecret: 'access_token_secret',
    }
    for (const key of Object.keys(names) as (keyof typeof tokens)[]) {
      if (!tokens[key]) {
        throw new Error(`Twitter config must include \`${names[key]}\` when using user auth.`)
      }
    }
    this.twitter = new TwitterApi(tokens)
  }

  public async getTweets(): Promise<Status[]> {
    const payload = {
      count: 10,
      trim_user: true,
      tweet_mode: "extended",
    }
    return this.twitter.v1.get<Status[]>(API_V1_1_ROOT + 'statuses/user_timeline.json', payload, { prefix: '', headers: headers() })
  }

  public async pin(id: string): Promise<Status> {
    const payload = {
      id,
      tweet_mode: "extended",
    }
    // twit と同じく、POST でもパラメーターはクエリ文字列で送り、本文は空にする
    const url = API_V1_1_ROOT + 'account/pin_tweet.json?' + new URLSearchParams(payload).toString()
    return this.twitter.v1.post<Status>(url, undefined, { prefix: '', headers: headers() })
  }
}

const main = async () => {
  const twitter = new TwitterUtil()

  if(process.argv[2]){ // ツイートをピンする
    twitter.pin(process.argv[2])

  } else { // ツイート一覧を見る
    const statuses = await twitter.getTweets()
    console.log(statuses.map(v => ({
      id_str: v.id_str,
      full_text: v.full_text
    })))
  }
}

main()
