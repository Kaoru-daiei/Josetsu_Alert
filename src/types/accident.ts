/** 事故・ヒヤリハットの1件 */
export interface Accident {
  id: string;
  latitude: number;
  longitude: number;
  /** 音声で読み上げる説明文 */
  description: string;
  /** 発生日（YYYY-MM-DD または YYYY-MM） */
  occurred_at: string;
  /** 種別（転落・接触・巻き込み等） */
  category: string;
}

/** 現在地から見た事故＋距離 */
export interface AccidentWithDistance extends Accident {
  distanceMeters: number;
}
