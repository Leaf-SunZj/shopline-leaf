## 文档
youtube iframe video api
https://developers.google.com/youtube/iframe_api_reference

vimeo iframe video api
https://developer.vimeo.com/player/sdk/reference#destroy-a-player

获取youtube 视频信息
https://abdus.dev/posts/youtube-oembed/

获取vimeo 视频信息
// https://developer.vimeo.com/api/oembed/videos

## VideoController 视频管理器
```js
this.videoController = new VideoController({
    plugins: [YouTube, Vimeo],
    $on: {
        // 视频初始化
        onReady(_, videoData) {
        },
        // 视频播放状态变更
        onStateChange(state, el) {        
        },
    },
});

// 创建一个视频
this.videoController.createVideo({
    $el,
    $wrapper,
    type,
    videoId,
    blockId,
    idx,
    loop: true,
    controls: false,
    autoplay: false,
    muted,
    width: 640,
    height: 360,
    useRealRatio: true,
});
```

## SDK plugin

### methods

// 创建一个video 实例
createVideo({
    $el,
    type: 'youtube', // youtube | vimeo
    videoId,
    blockId,
    idx,
    options,
    events
}) {}

findVideo(id): videoInstance {}

playerVideo(blockId, idx) {}

pauseVideo(blockId, idx) {}

muteVideo(blockId, idx) {}

unMuteVideo(blockId, idx) {}

### implements

export default class BaseSdk {
  static type;

    container;

    player;

    initEvent = () => {};

    findVideo(id): videoInstance {}

    playerVideo(blockId, idx) {}

    pauseVideo(blockId, idx) {}

    muteVideo(blockId, idx) {}

    unMuteVideo(blockId, idx) {}

    destroy = () => {};

    optTranster = () => {};

    tranformOptions = () => {};
}

```

```
options: {
    width: string
    height: string
    // 自动播放
    autoplay: boolean
    // 控件
    controls: boolean
    // 循环播放
    loop: boolean
    // 是否静音
    muted: boolean
    // 视频是否在支持的移动设备上内联播放
    playsinline: boolean
    // 质量
    quality
    // 速度
    speed
    // 使用真实视频比例
    useRealRatio
    ... 需根据对应的sdk 文档去实现参数转换
}
```

## 关于视频不能自动播放

https://smartslider.helpscoutdocs.com/article/1919-video-slider-issues#known-limitations

https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#the_autoplay_feature_policy

## 关于 pause() 与 play()  仅在 vimeo 产生的bug, 
原因是视频还在加载中，还没进入 playing 不能 paused
Uncaught (in promise) PlayInterrupted: The play() request was interrupted by a call to pause()

https://stackoverflow.com/questions/36803176/how-to-prevent-the-play-request-was-interrupted-by-a-call-to-pause-error


