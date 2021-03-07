import * as Twit from 'twit'
import { Status } from 'twitter-d'

export default class TwitterUtil {
  private twitter: Twit

  constructor() {
    this.twitter = new Twit({
      consumer_key: process.env.CONSUMER_KEY || '',
      consumer_secret: process.env.CONSUMER_SECRET || '',
      access_token: process.env.ACCESS_TOKEN || '',
      access_token_secret: process.env.ACCESS_TOKEN_SECRET || '',
    })
  }

  public async getTweets(): Promise<Status[]> {
    const payload = {
      count: 200,
      trim_user: true,
    }
    const ret = await this.twitter.get('statuses/user_timeline', payload)
    const statuses = ret.data as Status[]
    return statuses
  }

  public async pin(id: string): Promise<Status> {
    const payload = {
      id,
      tweet_mode: "extended",
    }
    const ret = await this.twitter.post('account/pin_tweet', payload)
    return ret.data as Status
  }
}

const main = async () => {
  const twitter = new TwitterUtil()

  if(process.argv[2]){　// ツイートをピンする
    twitter.pin(process.argv[2])

  } else {　// ツイート一覧を見る
    const statuses = await twitter.getTweets()
    console.log(statuses.slice(0,10).map(v => ({
      id_str: v.id_str,
      full_text: v.full_text
    })))
  }
}

main()
