var v;(function(e){e[e.EFFECT_REALTIME_SUB=0]="EFFECT_REALTIME_SUB",e[e.EFFECT_RERENDER_UI=1]="EFFECT_RERENDER_UI",e[e.EFFECT_RELOAD_PART=2]="EFFECT_RELOAD_PART",e[e.EFFECT_SHOW_FORM=3]="EFFECT_SHOW_FORM",e[e.EFFECT_SHOW_TOAST=4]="EFFECT_SHOW_TOAST",e[e.EFFECT_NAVIGATE_TO_URL=5]="EFFECT_NAVIGATE_TO_URL",e[e.EFFECT_SET_INTERVALS=7]="EFFECT_SET_INTERVALS",e[e.EFFECT_CREATE_ORDER=8]="EFFECT_CREATE_ORDER",e[e.EFFECT_WEB_VIEW=9]="EFFECT_WEB_VIEW",e[e.EFFECT_CAN_RUN_AS_USER=11]="EFFECT_CAN_RUN_AS_USER",e[e.EFFECT_TELEMETRY=12]="EFFECT_TELEMETRY",e[e.EFFECT_UPDATE_REQUEST_CONTEXT=13]="EFFECT_UPDATE_REQUEST_CONTEXT",e[e.EFFECT_SCREENSHOT_RESPONSE=14]="EFFECT_SCREENSHOT_RESPONSE",e[e.EFFECT_LOGIN_PROMPT=15]="EFFECT_LOGIN_PROMPT",e[e.EFFECT_PROMOTED_TELEMETRY=16]="EFFECT_PROMOTED_TELEMETRY",e[e.EFFECT_EXPOSE_EXPERIMENT=17]="EFFECT_EXPOSE_EXPERIMENT",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(v||(v={}));var ie;(function(e){e[e.UNSPECIFIED=0]="UNSPECIFIED",e[e.STARTED=1]="STARTED",e[e.COMPLETED=2]="COMPLETED",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(ie||(ie={}));var xe;(function(e){e[e.CLIENT=0]="CLIENT",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(xe||(xe={}));var mr="devvit-internal",I=(e,t)=>{let n={...e,realtimeEffect:e.realtime,id:t,scope:xe.CLIENT,type:mr};(e.showToast||e.navigateToUrl)&&(n.effect=e),parent.postMessage(n,"*")};var Ft="x-devvit-user-progress";var Gt=Symbol.for("@devvit/client/user-progress");function Ht(){let e=globalThis.fetch;if(e[Gt])return;let t=async(n,r)=>{let o=await e(n,r),i=new URL(n instanceof Request?n.url:n,location.href);if(i.origin===location.origin&&i.pathname.startsWith("/api/")&&!o.redirected)try{pr(o)}catch(l){console.error("Failed to deliver user progress notification",l)}return o};t[Gt]=!0,globalThis.fetch=t}function pr(e){let t=e.headers.get(Ft),n=t==="STARTED"?ie.STARTED:t==="COMPLETED"?ie.COMPLETED:void 0;n!==void 0&&I({type:v.EFFECT_WEB_VIEW,userProgress:{state:n}})}var H;(function(e){e[e.UNSPECIFIED=0]="UNSPECIFIED",e[e.INLINE_MODE=1]="INLINE_MODE",e[e.IMMERSIVE_MODE=2]="IMMERSIVE_MODE",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(H||(H={}));var fr=new Set;function hr(){return br(devvit.webViewMode)}function Kt(){addEventListener("message",gr)}function gr(e){if(e.data?.type!=="devvit-message"||!e.data?.data?.immersiveModeEvent)return;let t=hr();for(let n of fr)n(t)}function br(e){switch(e){case H.IMMERSIVE_MODE:return"expanded";case H.INLINE_MODE:case H.UNRECOGNIZED:case H.UNSPECIFIED:case void 0:return"inline";default:throw Error(`${e} not a WebViewImmersiveMode`)}}var S=globalThis.devvit?.context||{username:"Captain",subredditName:"CricketRush",client:{name:"WEB"},postId:"t3_chase123"};function Wt(e){if(typeof e=="string")return e;let{url:t,permalink:n}=e;if(n===void 0)return t;try{if(new URL(t).pathname!==n)return new URL(n,"https://www.reddit.com").toString()}catch{return new URL(n,"https://www.reddit.com").toString()}return t}var yr="devvit.v1.min.js";var Qo=`https://webview.devvit.net/scripts/${yr}`;function se(e){let t=Wt(e),n;try{n=new URL(t).toString()}catch{throw new TypeError(`Invalid URL: ${t}`)}Tr(n)}function Tr(e){I({navigateToUrl:{url:e},type:5})}var Ve;(function(e){e[e.CONSENT_STATUS_UNKNOWN=0]="CONSENT_STATUS_UNKNOWN",e[e.REVOKED=1]="REVOKED",e[e.GRANTED=2]="GRANTED",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(Ve||(Ve={}));var Yt;(function(e){e[e.SCOPE_UNKNOWN=0]="SCOPE_UNKNOWN",e[e.SUBMIT_POST=1]="SUBMIT_POST",e[e.SUBMIT_COMMENT=2]="SUBMIT_COMMENT",e[e.SUBSCRIBE_TO_SUBREDDIT=3]="SUBSCRIBE_TO_SUBREDDIT",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(Yt||(Yt={}));var je;(function(e){e[e.CLIENT_UNSPECIFIED=0]="CLIENT_UNSPECIFIED",e[e.ANDROID=1]="ANDROID",e[e.IOS=2]="IOS",e[e.SHREDDIT=3]="SHREDDIT",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(je||(je={}));var Vt;(function(e){e[e.HEIGHT_UNSPECIFIED=0]="HEIGHT_UNSPECIFIED",e[e.REGULAR=1]="REGULAR",e[e.TALL=2]="TALL",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(Vt||(Vt={}));var jt;(function(e){e[e.PRESENTATION_UNSPECIFIED=0]="PRESENTATION_UNSPECIFIED",e[e.EXPANDED=1]="EXPANDED",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(jt||(jt={}));var Zt;(function(e){e.COMMENT="t1_",e.ACCOUNT="t2_",e.LINK="t3_",e.MESSAGE="t4_",e.SUBREDDIT="t5_",e.AWARD="t6_"})(Zt||(Zt={}));var Ze=class extends Error{};Ze.prototype.name="InvalidTokenError";var Ce;(function(e){e[e.STRING=0]="STRING",e[e.PARAGRAPH=1]="PARAGRAPH",e[e.NUMBER=2]="NUMBER",e[e.BOOLEAN=3]="BOOLEAN",e[e.LIST=4]="LIST",e[e.SELECTION=5]="SELECTION",e[e.GROUP=6]="GROUP",e[e.IMAGE=7]="IMAGE",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(Ce||(Ce={}));var Je;(function(e){e[e.UNKNOWN_EVENT_SOURCE=0]="UNKNOWN_EVENT_SOURCE",e[e.USER=1]="USER",e[e.ADMIN=2]="ADMIN",e[e.MODERATOR=3]="MODERATOR",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(Je||(Je={}));var ze;(function(e){e[e.UNSPECIFIED_DELETION_REASON=0]="UNSPECIFIED_DELETION_REASON",e[e.SPAM=1]="SPAM",e[e.LEGAL=2]="LEGAL",e[e.OTHER=3]="OTHER",e[e.UNKNOWN=4]="UNKNOWN",e[e.EXPLICIT_CONTENT=5]="EXPLICIT_CONTENT",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(ze||(ze={}));var Xe;(function(e){e[e.OFF=0]="OFF",e[e.LENIENT=1]="LENIENT",e[e.MEDIUM=2]="MEDIUM",e[e.STRICT=3]="STRICT",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(Xe||(Xe={}));var Qe;(function(e){e[e.NULL_VALUE=0]="NULL_VALUE",e[e.ADMIN=1]="ADMIN",e[e.GOLD=2]="GOLD",e[e.GOLD_AUTO=3]="GOLD_AUTO",e[e.YES=4]="YES",e[e.SPECIAL=5]="SPECIAL",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(Qe||(Qe={}));var et;(function(e){e[e.ARCHIVED=0]="ARCHIVED",e[e.EMPLOYEES_ONLY=1]="EMPLOYEES_ONLY",e[e.GOLD_ONLY=2]="GOLD_ONLY",e[e.GOLD_RESTRICTED=3]="GOLD_RESTRICTED",e[e.PRIVATE=4]="PRIVATE",e[e.PUBLIC=5]="PUBLIC",e[e.RESTRICTED=6]="RESTRICTED",e[e.USER=7]="USER",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(et||(et={}));var tt;(function(e){e[e.UNKNOWN_SUBREDDIT_RATING=0]="UNKNOWN_SUBREDDIT_RATING",e[e.E=1]="E",e[e.M1=2]="M1",e[e.M2=3]="M2",e[e.D=4]="D",e[e.V=5]="V",e[e.X=6]="X",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(tt||(tt={}));var qt;(function(e){e[e.SUBREDDIT_TYPE_UNSPECIFIED=0]="SUBREDDIT_TYPE_UNSPECIFIED",e[e.SUBREDDIT_TYPE_UNKNOWN=1]="SUBREDDIT_TYPE_UNKNOWN",e[e.SUBREDDIT_TYPE_ARCHIVED=2]="SUBREDDIT_TYPE_ARCHIVED",e[e.SUBREDDIT_TYPE_EMPLOYEES_ONLY=3]="SUBREDDIT_TYPE_EMPLOYEES_ONLY",e[e.SUBREDDIT_TYPE_GOLD_ONLY=4]="SUBREDDIT_TYPE_GOLD_ONLY",e[e.SUBREDDIT_TYPE_GOLD_RESTRICTED=5]="SUBREDDIT_TYPE_GOLD_RESTRICTED",e[e.SUBREDDIT_TYPE_PRIVATE=6]="SUBREDDIT_TYPE_PRIVATE",e[e.SUBREDDIT_TYPE_PUBLIC=7]="SUBREDDIT_TYPE_PUBLIC",e[e.SUBREDDIT_TYPE_RESTRICTED=8]="SUBREDDIT_TYPE_RESTRICTED",e[e.SUBREDDIT_TYPE_USER=9]="SUBREDDIT_TYPE_USER",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(qt||(qt={}));var Jt;(function(e){e[e.SUBREDDIT_RATING_UNSPECIFIED=0]="SUBREDDIT_RATING_UNSPECIFIED",e[e.SUBREDDIT_RATING_UNKNOWN=1]="SUBREDDIT_RATING_UNKNOWN",e[e.SUBREDDIT_RATING_E=2]="SUBREDDIT_RATING_E",e[e.SUBREDDIT_RATING_M1=3]="SUBREDDIT_RATING_M1",e[e.SUBREDDIT_RATING_M2=4]="SUBREDDIT_RATING_M2",e[e.SUBREDDIT_RATING_D=5]="SUBREDDIT_RATING_D",e[e.SUBREDDIT_RATING_V=6]="SUBREDDIT_RATING_V",e[e.SUBREDDIT_RATING_X=7]="SUBREDDIT_RATING_X",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(Jt||(Jt={}));var zt;(function(e){e.Installation="installation",e.App="app"})(zt||(zt={}));function N(e){let t;e instanceof Object?t={text:e.text,appearance:e.appearance==="success"?1:0}:t={text:e},I({showToast:{toast:t},type:4})}Kt();Ht();var nt;(function(e){e[e.STATUS_CANCELLED=0]="STATUS_CANCELLED",e[e.STATUS_SUCCESS=1]="STATUS_SUCCESS",e[e.STATUS_ERROR=2]="STATUS_ERROR",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(nt||(nt={}));var rt;(function(e){e[e.REALTIME_SUBSCRIBED=0]="REALTIME_SUBSCRIBED",e[e.REALTIME_UNSUBSCRIBED=1]="REALTIME_UNSUBSCRIBED",e[e.UNRECOGNIZED=-1]="UNRECOGNIZED"})(rt||(rt={}));function Xt(e,t){return t.awaitingReview?`${e} posted \u2014 waiting for moderator review before others can see it.`:`${e} posted.`}var y={ChallengeCurrent:"/api/challenge/current",ChallengeLeaderboard:"/api/challenge/leaderboard",DailyLeaderboard:"/api/leaderboard/daily",WeeklyLeaderboard:"/api/leaderboard/weekly",ChallengeRecordResult:"/api/challenge/result",ChallengeCreatePost:"/api/challenge/create-post",ChallengeCommentAsUser:"/api/challenge/comment-user",AnalyticsEvent:"/api/analytics/event",AnalyticsSummary:"/api/analytics/summary",PlayerProfileGet:"/api/player/profile",TeamIdentitySave:"/api/player/team",SoundSettingSave:"/api/player/sound",PlayerDataDeleteRequest:"/api/player/data/delete",PlayerDataDeleteCancel:"/api/player/data/delete/cancel",ModSettingsGet:"/api/mod/settings",ModSettingsSave:"/api/mod/settings/save",ModPostNow:"/api/mod/post-now",DiscussionCurrent:"/api/discussion/current",DiscussionCreatePost:"/api/discussion/create-post",DiscussionSubmit:"/api/discussion/submit",DiscussionComment:"/api/discussion/comment",CreationLimits:"/api/creation/limits",CommunityStatus:"/api/community/status",CommunityJoin:"/api/community/join",OnPostCreate:"/internal/menu/post-create",OnAppInstall:"/internal/on-app-install",OnAppUpgrade:"/internal/on-app-upgrade",OnAutoChallengeTask:"/internal/scheduler/auto-challenge-post",OnStorageMaintenanceTask:"/internal/scheduler/storage-maintenance",OnStorageReport:"/internal/menu/storage-report",OnPostDelete:"/internal/triggers/post-delete",OnCommentDelete:"/internal/triggers/comment-delete"};var Qt="cricket-rush:sound-muted";function wr(){try{let e=window.localStorage.getItem(Qt);return e==="1"?!0:e==="0"?!1:null}catch{return null}}function en(e){try{window.localStorage.setItem(Qt,e?"1":"0")}catch{}}var B=wr()??!1;function K(){return B}function ot(e){return e===B||(B=e,en(e)),B}function at(e){return B=e,en(e),fetch(y.SoundSettingSave,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({soundMuted:e})}).then(t=>t.ok?t.json():null).then(t=>{t&&t.type==="sound-setting"&&t.saved&&t.soundMuted!==B&&ot(t.soundMuted)}).catch(()=>{}),B}var tn="cricket-rush:players-2d";var nn=!1;function rn(e=location.search,t=Date.now()){let n=new URLSearchParams(e).get("chars");return n==="2d"?!1:n==="3d"?!0:!it(t)}function it(e=Date.now()){if(nn)return!0;try{let t=Number(window.localStorage.getItem(tn));if(t>0&&e-t<6048e5)return!0}catch{}return!1}function on(e=Date.now()){nn=!0;try{window.localStorage.setItem(tn,String(e))}catch{}}var st="cricket_rush_joined";function an(e){try{e?window.localStorage.setItem(st,"true"):window.localStorage.removeItem(st)}catch{}}function sn(){try{return window.localStorage.getItem(st)==="true"}catch{return!1}}async function ln(){try{let e=await fetch(y.CommunityStatus,{method:"GET"});if(!e.ok)return null;let t=await e.json();return an(!!t.isSubscribed),t}catch(e){return console.warn("Failed to check community status:",e),null}}async function un(){try{let e=await fetch(y.CommunityJoin,{method:"POST"});if(!e.ok)return!1;let t=await e.json(),n=!!(t.ok&&t.isSubscribed);return n&&an(!0),n}catch(e){return console.warn("Failed to join community:",e),!1}}function lt(e,t,n=Math.random){return Math.floor(n()*(t-e+1))+e}function cn(e){let t=[...e.retiredBatters,e.striker,e.nonStriker],n=Math.max(0,Math.round(e.currentBalls)),r=t.map(d=>n>0?Math.max(1,Math.ceil(d.runs/6)):0);if(t.reduce((d,h)=>d+h.balls,0)===n&&t.every((d,h)=>Number.isInteger(d.balls)&&d.balls>=r[h]))return e;let i=r.reduce((d,h)=>d+h,0)<=n?r:r.map(()=>0),l=n-i.reduce((d,h)=>d+h,0),f=t.map((d,h)=>Math.max(0,d.balls-i[h])),g=f.reduce((d,h)=>d+h,0),C=f.map(d=>g>0?l*d/g:l/t.length),w=C.map((d,h)=>i[h]+Math.floor(d)),M=n-w.reduce((d,h)=>d+h,0),oe=C.map((d,h)=>[d-Math.floor(d),h]).sort((d,h)=>h[0]-d[0]);for(let d=0;M>0;d=(d+1)%oe.length,M-=1){let h=oe[d][1];w[h]=w[h]+1}let ae=e.retiredBatters.length;return{...e,retiredBatters:e.retiredBatters.map((d,h)=>({...d,balls:w[h]})),striker:{...e.striker,balls:w[ae]},nonStriker:{...e.nonStriker,balls:w[ae+1]}}}function dn(e){return`${Math.floor(e/6)}.${e%6}`}function mn(e,t=Math.random){let n=lt(0,e.length-1,t),r=lt(0,e.length-1,t);for(let o=0;o<8&&r===n;o+=1)r=lt(0,e.length-1,t);return r===n&&(r=(n+1)%e.length),[e[n],e[r]]}function pn(e,t,n=`${t}s`){return e===1?t:n}function fn(e,t){let n=Math.max(0,Math.round(Number(t.score)||0)),r=Math.max(0,Math.min(10,Math.round(Number(t.wickets)||0))),o=e.currentBalls+e.maxBallsRemaining,i=Math.max(e.currentBalls,Math.min(o,Math.round(Number(t.ballsBowled)||e.currentBalls)));if(n>=e.target){let C=Math.max(10-r,0),w=Math.max(o-i,0),M=[`${C}-wicket win`,`${w} ${pn(w,"ball")} left`];return`\u{1F3C6} **${n}/${r}** \u2014 chased ${e.target} \xB7 ${M.join(" \xB7 ")} \u{1F3CF}`}let f=Math.max(e.target-n,0),g=r>=10?"all out \xB7 ":"";return`\u{1F3CF} **${n}/${r}** \u2014 ${g}${f} ${pn(f,"run")} short chasing ${e.target}.`}var hn=[{heading:"What is kept",text:"Your Reddit username with your results on a challenge's leaderboard and on the daily and weekly boards; your team, jersey colour, streak, badges, titles and sound setting; and that you joined the community with the game's Join button, so it isn't offered to you again."},{heading:"Why",text:"Only to run the game: leaderboards, streaks, badges and titles. Nothing else."},{heading:"How long",text:"Your profile (and that you joined with the game's button) is removed after 30 days without playing. Names on leaderboards, the creator line on a challenge you posted, and names in weekly recaps are removed after 30 days."},{heading:"What is not collected",text:"No email, location, contacts or device identifiers, and nothing is sent outside Reddit. The moderators see anonymous counts only (plays, wins, phone or desktop, app or browser, and how smoothly the 3D players ran by graphics chip family), never linked to you."},{heading:"Your choices",text:"Delete your data here at any time. Posts and comments you made are yours on Reddit, where you can delete them."}];function Re(e){let t=e?`r/${e}`:"";return`https://www.reddit.com/message/compose?to=${encodeURIComponent(t)}&subject=${encodeURIComponent("Cricket Rush: a problem")}`}function ut(e){let t=e.toLowerCase();return t.includes("adreno")?"adreno":t.includes("mali")?"mali":t.includes("apple")?"apple":t.includes("powervr")?"powervr":t.includes("xclipse")||t.includes("samsung")?"xclipse":t.includes("intel")?"intel":t.includes("nvidia")||t.includes("geforce")?"nvidia":t.includes("amd")||t.includes("radeon")?"amd":"other"}function ct(e,t){return e==="death-over"?"death-over":e==="super-over"?"super-over":t>=10?"full-match-10":"full-match-5"}function U(e){fetch(y.AnalyticsEvent,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:e})}).catch(()=>{})}function gn(e){let t=JSON.stringify({event:e});if(typeof navigator.sendBeacon=="function"){let n=new Blob([t],{type:"application/json"});if(navigator.sendBeacon(y.AnalyticsEvent,n))return}U(e)}function xr(){return window.matchMedia("(pointer: coarse)").matches||window.innerWidth<768?"mobile":"desktop"}function bn(){let e;try{e=S.client?.name}catch{}return e==="ANDROID"?"android-app":e==="IOS"?"ios-app":xr()==="mobile"?"web-mobile":"web-desktop"}function yn(e,t){let n=bn();t.state==="on"?U({kind:"players",outcome:"3d",surface:e,place:n,gpu:ut(t.gpu)}):t.state==="slow"?U({kind:"players",outcome:"slow",surface:e,place:n,gpu:ut(t.gpu),fps:t.fps,workShare:t.workShare,afterMs:t.afterMs}):U({kind:"players",outcome:t.state,surface:e,place:n})}function En(e){U({kind:"players",outcome:"remembered",surface:e,place:bn()})}var dt=[{index:0,id:"streak-3",name:"Three in a row",group:"coming-back",goal:"Play 3 days running"},{index:1,id:"streak-7",name:"Full week",group:"coming-back",goal:"Play 7 days running"},{index:2,id:"streak-14",name:"Fortnight",group:"coming-back",goal:"Play 14 days running"},{index:3,id:"streak-30",name:"Thirty days",group:"coming-back",goal:"Play 30 days running"},{index:4,id:"returned",name:"Back again",group:"coming-back",goal:"Return after a long streak breaks"},{index:5,id:"won-death-over",name:"Death over won",group:"every-format"},{index:6,id:"won-super-over",name:"Super over won",group:"every-format"},{index:7,id:"won-five",name:"Five overs won",group:"every-format"},{index:8,id:"won-ten",name:"Ten overs won",group:"every-format"},{index:9,id:"won-all-formats",name:"All four formats",group:"every-format"},{index:10,id:"format-regular",name:"Format regular",group:"every-format",goal:"10 chases in one format"},{index:11,id:"last-ball",name:"Last-ball finish",group:"under-pressure"},{index:12,id:"all-ten",name:"All ten in hand",group:"under-pressure"},{index:13,id:"sixteen-an-over",name:"Sixteen an over",group:"under-pressure"},{index:14,id:"nine-down",name:"Nine down",group:"under-pressure"},{index:15,id:"six-to-finish",name:"Six to finish",group:"under-pressure"},{index:16,id:"no-dots",name:"No dots in an over",group:"under-pressure"},{index:17,id:"twenty-off-an-over",name:"Twenty off an over",group:"under-pressure"},{index:18,id:"team-created",name:"Team created",group:"around-the-club"},{index:19,id:"half-century",name:"Half-century",group:"depth",goal:"Score 50 in one chase"},{index:20,id:"ten-wins",name:"Ten wins",group:"depth",goal:"Win 10 chases"},{index:21,id:"challenge-creator",name:"Challenge creator",group:"around-the-club",retired:!0},{index:22,id:"ten-played-yours",name:"Ten played yours",group:"around-the-club",retired:!0},{index:23,id:"someone-beat-you",name:"Someone beat you",group:"around-the-club",retired:!0},{index:24,id:"fifty-wins",name:"Fifty wins",group:"depth",goal:"Win 50 chases"},{index:25,id:"ten-chases",name:"Ten chases",group:"depth",goal:"Complete 10 chases"},{index:26,id:"fifty-chases",name:"Fifty chases",group:"depth",goal:"Complete 50 chases"},{index:27,id:"hundred-chases",name:"Hundred chases",group:"depth",goal:"Complete 100 chases"},{index:28,id:"five-hundred-chases",name:"Five hundred chases",group:"depth",goal:"Complete 500 chases"},{index:29,id:"century-maker",name:"Century maker",group:"depth",goal:"Score 100 in one chase"},{index:30,id:"perfect-week",name:"Perfect week",group:"depth",goal:"Play every day for a week"},{index:31,id:"collector",name:"Collector",group:"depth",goal:"Unlock 20 other badges"}],Cr=dt.length,le=dt.filter(e=>!e.retired),vs=new Map(dt.map(e=>[e.id,e]));function Se(e){let t=0;for(let n of le)(e&1<<n.index)!==0&&(t+=1);return t}var _=[{key:"chennai-blasters",name:"Chennai Blasters",shortName:"CHB",city:"Chennai",players:[{name:"Girik Ghaisas",role:"wk-batter"},{name:"Amogh Marolkar",role:"batter",bats:"left"},{name:"Pranit Belsare",role:"wk-batter"},{name:"Rupert Kirkbride",role:"batter",bats:"left"},{name:"Ojas Sabnis",role:"all-rounder"},{name:"Piers Ashcombe",role:"wk-batter"},{name:"Miles Ockenden",role:"all-rounder",canBowl:!0,bowlerType:0,arm:"left"},{name:"Ketan Phadnis",role:"all-rounder",canBowl:!0,bowlerType:1,bats:"left",arm:"left"},{name:"Devarsh Nagvekar",role:"bowler",canBowl:!0,bowlerType:1},{name:"Stefan Bergstrand",role:"bowler",canBowl:!0,bowlerType:0},{name:"Ishvar Bhandal",role:"bowler",canBowl:!0,bowlerType:0}]},{key:"delhi-dynamos",name:"Delhi Drifters",shortName:"DDR",city:"Delhi",players:[{name:"Sohum Deshkar",role:"wk-batter"},{name:"Elliot Winstanley",role:"batter",bats:"left"},{name:"Kavish Joglekar",role:"batter"},{name:"Nakul Sarpotdar",role:"all-rounder",canBowl:!0,bowlerType:1,arm:"left"},{name:"Tobias Veldkamp",role:"all-rounder",canBowl:!0,bowlerType:1,bats:"left"},{name:"Aarav Kelkar",role:"wk-batter"},{name:"Dorian Halsted",role:"batter",bats:"left"},{name:"Anders Nyholm",role:"bowler",canBowl:!0,bowlerType:0,arm:"left"},{name:"Pranshu Barve",role:"bowler",canBowl:!0,bowlerType:1},{name:"Hemal Zende",role:"bowler",canBowl:!0,bowlerType:0},{name:"Emmett Braxfield",role:"bowler",canBowl:!0,bowlerType:0}]},{key:"ahmedabad-falcons",name:"Ahmedabad Falcons",shortName:"AHF",city:"Ahmedabad",players:[{name:"Chetan Zaveri",role:"batter"},{name:"Grayden Milbourne",role:"batter",bats:"left"},{name:"Parth Zalavadiya",role:"wk-batter"},{name:"Rhys Fairhurst",role:"batter",bats:"left"},{name:"Manthan Sarkhel",role:"all-rounder",canBowl:!0,bowlerType:1,bats:"left"},{name:"Roscoe Tarleton",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Zahaan Marfani",role:"bowler",canBowl:!0,bowlerType:1,arm:"left"},{name:"Adnaan Rustomji",role:"bowler",canBowl:!0,bowlerType:0,arm:"left"},{name:"Casper Ahlgren",role:"bowler",canBowl:!0,bowlerType:0},{name:"Rowan Feltwell",role:"bowler",canBowl:!0,bowlerType:0},{name:"Dhairya Pethe",role:"bowler",canBowl:!0,bowlerType:1}]},{key:"kolkata-comets",name:"Kolkata Comets",shortName:"KOC",city:"Kolkata",players:[{name:"Ashutosh Palkar",role:"batter",bats:"left"},{name:"Kunwar Bafna",role:"wk-batter"},{name:"Landon Vosburgh",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Devansh Ruikar",role:"batter"},{name:"Jagvir Tembhurne",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Fergus Loughnane",role:"batter",bats:"left"},{name:"Rehaan Mokashi",role:"all-rounder",canBowl:!0,bowlerType:1,bats:"left",arm:"left"},{name:"Lars Bergquist",role:"all-rounder",canBowl:!0,bowlerType:0,arm:"left"},{name:"Vedang Bhojane",role:"all-rounder",canBowl:!0,bowlerType:1},{name:"Adhiraj Halvekar",role:"bowler",canBowl:!0,bowlerType:0},{name:"Niall Swaffield",role:"bowler",canBowl:!0,bowlerType:0}]},{key:"lucknow-strikers",name:"Lucknow Strikers",shortName:"LKS",city:"Lucknow",players:[{name:"Ewan Rothbury",role:"all-rounder",canBowl:!0,bowlerType:1},{name:"Sarthak Mhaskar",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Ritvik Waghmode",role:"wk-batter"},{name:"Warren Ashfield",role:"wk-batter",bats:"left"},{name:"Alok Barhate",role:"batter"},{name:"Gideon Harkwell",role:"batter",bats:"left"},{name:"Advait Marathe",role:"all-rounder",canBowl:!0,bowlerType:1,arm:"left"},{name:"Sameep Chorghade",role:"bowler",canBowl:!0,bowlerType:0,arm:"left"},{name:"Anton Sedlacek",role:"bowler",canBowl:!0,bowlerType:0},{name:"Chaitya Sonwane",role:"bowler",canBowl:!0,bowlerType:1},{name:"Declan Vellacott",role:"bowler",canBowl:!0,bowlerType:0}]},{key:"mumbai-waves",name:"Mumbai Waves",shortName:"MUW",city:"Mumbai",players:[{name:"Marten Veldhuis",role:"wk-batter"},{name:"Aatish Bhorwade",role:"batter",bats:"left"},{name:"Sujal Ghatpande",role:"batter"},{name:"Nirvaan Kotecha",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Everett Tunbridge",role:"batter",bats:"left"},{name:"Grayson Delafield",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Tanmay Kolhatkar",role:"all-rounder",canBowl:!0,bowlerType:1,bats:"left"},{name:"Aniruth Bavdhan",role:"bowler",canBowl:!0,bowlerType:0,arm:"left"},{name:"Pritesh Gurjale",role:"bowler",canBowl:!0,bowlerType:0},{name:"Julian Ravensdale",role:"bowler",canBowl:!0,bowlerType:1},{name:"Vivaan Rasquinha",role:"bowler",canBowl:!0,bowlerType:0}]},{key:"punjab-pulse",name:"Punjab Pulse",shortName:"PUP",city:"Punjab",players:[{name:"Gurnaaz Kalsi",role:"wk-batter"},{name:"Kartav Rangwani",role:"batter",bats:"left"},{name:"Perry Hardacre",role:"all-rounder",canBowl:!0,bowlerType:1},{name:"Shourya Bisht",role:"batter"},{name:"Nolan Ashbridge",role:"batter",bats:"left"},{name:"Torben Ahlberg",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Yuvaan Kharkade",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Pieter Voskuil",role:"bowler",canBowl:!0,bowlerType:0},{name:"Ojaswi Nandode",role:"bowler",canBowl:!0,bowlerType:0,arm:"left"},{name:"Harkirat Bhinder",role:"bowler",canBowl:!0,bowlerType:0},{name:"Vihaan Ranjekar",role:"bowler",canBowl:!0,bowlerType:1}]},{key:"jaipur-jets",name:"Jaipur Jets",shortName:"JAJ",city:"Jaipur",players:[{name:"Aryaveer Sanghal",role:"batter"},{name:"Rudransh Bhende",role:"batter",bats:"left"},{name:"Devraj Jhalani",role:"wk-batter"},{name:"Sholto Pemberton",role:"all-rounder",canBowl:!0,bowlerType:1,bats:"left",arm:"left"},{name:"Kelston Ainsdale",role:"batter",bats:"left"},{name:"Trevon Lockridge",role:"wk-batter"},{name:"Hemang Karkhanis",role:"all-rounder",canBowl:!0,bowlerType:1},{name:"Rylan Ashgrove",role:"bowler",canBowl:!0,bowlerType:0,arm:"left"},{name:"Tushit Bhanushali",role:"bowler",canBowl:!0,bowlerType:0},{name:"Braylon Wexley",role:"bowler",canBowl:!0,bowlerType:0},{name:"Bhavesh Ganjapure",role:"bowler",canBowl:!0,bowlerType:0}]},{key:"bengaluru-bolts",name:"Bengaluru Bolts",shortName:"BEB",city:"Bengaluru",players:[{name:"Samarth Anchalia",role:"batter"},{name:"Pranav Sanzgiri",role:"batter",bats:"left"},{name:"Fletcher Danby",role:"batter"},{name:"Tarush Nallamby",role:"wk-batter"},{name:"Sullivan Kinvara",role:"batter",bats:"left"},{name:"Sarvesh Kadam",role:"all-rounder",canBowl:!0,bowlerType:0,bats:"left",arm:"left"},{name:"Aayush Sonpurkar",role:"all-rounder",canBowl:!0,bowlerType:1},{name:"Kirby Wintersgill",role:"bowler",canBowl:!0,bowlerType:0},{name:"Deven Salunkhe",role:"bowler",canBowl:!0,bowlerType:0},{name:"Kunal Sikligar",role:"bowler",canBowl:!0,bowlerType:1,arm:"left"},{name:"Emrys Kirtland",role:"bowler",canBowl:!0,bowlerType:0}]},{key:"hyderabad-blaze",name:"Hyderabad Blaze",shortName:"HYB",city:"Hyderabad",players:[{name:"Mihir Deolekar",role:"all-rounder",canBowl:!0,bowlerType:1},{name:"Bharath Yellandur",role:"wk-batter",bats:"left"},{name:"Ruben Kestelyn",role:"wk-batter"},{name:"Faraz Mahtani",role:"wk-batter"},{name:"Weston Fernsby",role:"batter",bats:"left"},{name:"Nakshat Bolagam",role:"all-rounder",canBowl:!0,bowlerType:0},{name:"Hugo Stanmore",role:"bowler",canBowl:!0,bowlerType:0},{name:"Adhrit Kanchwala",role:"all-rounder",canBowl:!0,bowlerType:1},{name:"Zohaib Mirzapuri",role:"bowler",canBowl:!0,bowlerType:0,arm:"left"},{name:"Nirbhay Godambe",role:"bowler",canBowl:!0,bowlerType:0},{name:"Roland Wisbech",role:"bowler",canBowl:!0,bowlerType:0}]}];var ue=[{id:0,name:"Crimson",hex:"#D94F3D"},{id:1,name:"Ocean",hex:"#2F7AD9"},{id:2,name:"Saffron",hex:"#E8963A"},{id:3,name:"Emerald",hex:"#2FA36B"},{id:4,name:"Violet",hex:"#8A5AD1"},{id:5,name:"Teal",hex:"#219B9D"},{id:6,name:"Rose",hex:"#D2528C"},{id:7,name:"Sand",hex:"#C8A44A"},{id:8,name:"Slate",hex:"#5C7085"},{id:9,name:"Lime",hex:"#7FB13B"},{id:10,name:"Copper",hex:"#B4643A"},{id:11,name:"Indigo",hex:"#4A54B0"}];function $(e){return ue[e]??ue[0]}function Tn(e){return(e+6)%ue.length}function Rr(e){return _.find(t=>t.key===e)}function ve(e){return Rr(e)?.name??""}function wn(e,t){let n=_,r=n.findIndex(o=>o.key===e);for(let o=1;o<=n.length;o+=1){let i=n[(Math.max(0,r)+o)%n.length];if(i.key!==e&&i.key!==t)return i.key}return e}function xn(e,t){return Number.isFinite(e)?Math.max(0,Math.ceil((e-t)/(3600*1e3))):0}var Cn="team-editor-styles",Sr=`
.team-editor-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(3, 10, 7, 0.72);
}
.team-editor-backdrop[hidden] { display: none; }
.team-editor {
  width: min(400px, 100%);
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 16px;
  border: 1px solid rgba(255, 242, 214, 0.18);
  border-radius: 16px;
  background: rgba(8, 20, 16, 0.98);
  color: #fff2d6;
  font-family: var(--font-body);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.46);
}
.team-editor h2 { margin: 0; font-size: 1.05rem; }
.team-editor-kicker {
  margin: 0 0 2px;
  color: #ffcf66;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.team-editor-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.team-editor-label {
  display: block;
  margin: 16px 0 6px;
  color: rgba(255, 242, 214, 0.72);
  font-size: 0.7rem;
}
.team-editor input[type="text"] {
  width: 100%;
  padding: 10px 11px;
  border: 1px solid rgba(255, 242, 214, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.055);
  color: #fff2d6;
  font: inherit;
  font-size: 0.85rem;
}
.team-editor input[type="text"]:focus-visible {
  outline: 2px solid rgba(255, 207, 102, 0.5);
  outline-offset: 1px;
}
.team-editor-count { margin: 6px 1px 0; color: rgba(255, 242, 214, 0.5); font-size: 0.62rem; }
.team-editor-swatches { display: flex; flex-wrap: wrap; gap: 8px; }
.team-editor-swatch {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
}
.team-editor-swatch[aria-pressed="true"] { border-color: #fff2d6; }
.team-editor-swatch:focus-visible { outline: 2px solid #ffcf66; outline-offset: 2px; }
.team-editor-preview {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 14px;
  padding: 11px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.055);
}
.team-editor-jersey { width: 26px; height: 34px; border-radius: 5px; }
.team-editor-preview strong { display: block; font-size: 0.85rem; }
.team-editor-preview span { color: rgba(255, 242, 214, 0.62); font-size: 0.64rem; }
.team-editor-status { margin: 12px 0 0; min-height: 1em; font-size: 0.68rem; color: rgba(255, 242, 214, 0.62); }
.team-editor-status.is-error { color: #ffb08a; }
.team-editor-status.is-ok { color: #a7efc1; }
.team-editor-actions { display: flex; gap: 8px; margin-top: 14px; }
.team-editor-save, .team-editor-cancel {
  padding: 10px 14px;
  border-radius: 10px;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
.team-editor-save { flex: 1; border: 0; background: #ffcf66; color: #0e2b20; }
.team-editor-cancel { border: 1px solid rgba(255, 242, 214, 0.22); background: transparent; color: rgba(255, 242, 214, 0.82); }
.team-editor-save:disabled { opacity: 0.6; cursor: default; }
.team-editor-danger {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 242, 214, 0.14);
}
.team-editor-danger h3 { margin: 0 0 4px; font-size: 0.8rem; font-weight: 500; }
.team-editor-privacy { margin: 0 0 12px; font-size: 0.68rem; color: rgba(255, 242, 214, 0.62); }
.team-editor-privacy summary { cursor: pointer; color: rgba(255, 242, 214, 0.86); font-size: 0.72rem; }
.team-editor-privacy dl { margin: 8px 0 0; }
.team-editor-privacy dt { margin-top: 6px; color: rgba(255, 242, 214, 0.86); }
.team-editor-privacy dd { margin: 2px 0 0; line-height: 1.45; }
.team-editor-help {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 242, 214, 0.14);
}
.team-editor-help p { margin: 0 0 8px; font-size: 0.68rem; color: rgba(255, 242, 214, 0.62); line-height: 1.45; }
.team-editor-report {
  padding: 7px 12px;
  border: 1px solid rgba(255, 242, 214, 0.22);
  border-radius: 9px;
  background: transparent;
  color: rgba(255, 242, 214, 0.82);
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}
.team-editor-danger p { margin: 0 0 10px; font-size: 0.68rem; color: rgba(255, 242, 214, 0.62); line-height: 1.45; }
.team-editor-delete {
  padding: 8px 13px;
  border: 1px solid rgba(255, 138, 110, 0.5);
  border-radius: 9px;
  background: transparent;
  color: #ffb08a;
  font: inherit;
  font-size: 0.74rem;
  cursor: pointer;
}
.team-editor-delete-cancel {
  padding: 8px 13px;
  border: 1px solid rgba(255, 242, 214, 0.24);
  border-radius: 9px;
  background: transparent;
  color: rgba(255, 242, 214, 0.86);
  font: inherit;
  font-size: 0.74rem;
  cursor: pointer;
}
.team-editor-pending {
  margin: 0 0 10px;
  padding: 9px 11px;
  border: 1px solid rgba(255, 138, 110, 0.4);
  border-radius: 9px;
  background: rgba(255, 138, 110, 0.1);
  color: #ffb08a;
  font-size: 0.7rem;
  line-height: 1.45;
}
`,Ie=null,E={teamKey:"",colourId:0,pendingDeletionAtIso:null},Rn=null;function vr(){if(document.getElementById(Cn))return;let e=document.createElement("style");e.id=Cn,e.textContent=Sr,document.head.append(e)}function c(e,t,n){let r=document.createElement(e);return t&&(r.className=t),n!==void 0&&(r.textContent=n),r}function Ir(){vr();let e=c("div","team-editor-backdrop");e.hidden=!0;let t=c("div","team-editor");t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.setAttribute("aria-label","Your profile");let n=c("div","team-editor-head"),r=c("div");r.append(c("p","team-editor-kicker","Your club"),c("h2",void 0,"Your profile"));let o=c("button","team-editor-cancel","Close");o.type="button",n.append(r,o);let i=c("label","team-editor-label","Your team");i.htmlFor="team-editor-team";let l=c("select");l.id="team-editor-team";let f=c("option",void 0,"Pick a team");f.value="",l.append(f);for(let u of _){let p=c("option",void 0,u.name);p.value=u.key,l.append(p)}let g=c("p","team-editor-count"),C=c("p","team-editor-label","Jersey colour"),w=c("div","team-editor-swatches"),M=c("div","team-editor-preview"),oe=c("span","team-editor-jersey"),ae=c("div"),d=c("strong"),h=c("span",void 0,"This is how your team appears in a match.");ae.append(d,h),M.append(oe,ae);let ye=c("p","team-editor-status"),Bt=c("div","team-editor-actions"),z=c("button","team-editor-save","Save team");z.type="button",Bt.append(z);let Ge=c("div","team-editor-danger");Ge.append(c("h3",void 0,"Your data"));let ur=c("p",void 0,"Deleting removes your team, streak, achievements and titles from Cricket Rush. Posts and comments you made on Reddit are not affected \u2014 you can delete those on Reddit."),cr=c("p",void 0,"Your Cricket Rush data is also removed automatically after 30 days without playing. Playing again at any point resets that."),Ee=c("p","team-editor-pending");Ee.hidden=!0;let X=c("button","team-editor-delete","Delete my data");X.type="button";let G=c("button","team-editor-delete-cancel","Cancel deletion");G.type="button",G.hidden=!0;let He=c("details","team-editor-privacy");He.append(c("summary",void 0,"Privacy: what Cricket Rush keeps"));let Ut=c("dl");for(let u of hn)Ut.append(c("dt",void 0,u.heading),c("dd",void 0,u.text));He.append(Ut),Ge.append(ur,cr,He,Ee,X,G);let Ke=c("div","team-editor-help");Ke.append(c("h3",void 0,"Help"),c("p",void 0,"Something wrong with the game, or a question about your data? Message this community's moderators."));let We=c("button","team-editor-report","Report a problem");We.type="button",We.addEventListener("click",()=>se(Re(S?.subredditName))),Ke.append(We),t.append(n,i,l,g,C,w,M,ye,Bt,Ge,Ke),e.append(t);let k=(u,p="")=>{ye.textContent=u,ye.classList.toggle("is-error",p==="error"),ye.classList.toggle("is-ok",p==="ok")},Te=()=>{let u=ve(E.teamKey);d.textContent=u||"No team yet",oe.style.background=$(E.colourId).hex,g.textContent=u?"":"Pick a team to play as.",z.disabled=!E.teamKey},Ye=()=>{let u=E.pendingDeletionAtIso;if(Ee.hidden=!u,X.hidden=!!u,G.hidden=!u,!u)return;let p=xn(Date.parse(u),Date.now());Ee.textContent=p>0?`Your data will be deleted in ${p} hour${p===1?"":"s"}. Cancel before then to keep it.`:"Your data will be deleted shortly. Cancel now to keep it."};X.addEventListener("click",()=>{(async()=>{X.disabled=!0;try{let p=await(await fetch(y.PlayerDataDeleteRequest,{method:"POST"})).json();if(!p.signedIn){k("Sign in to manage your data.","error");return}E={...E,pendingDeletionAtIso:p.pendingDeletionAtIso},Ye(),k("Deletion scheduled.","ok")}catch(u){console.error(u),k("Could not schedule deletion. Try again.","error")}finally{X.disabled=!1}})()}),G.addEventListener("click",()=>{(async()=>{G.disabled=!0;try{let p=await(await fetch(y.PlayerDataDeleteCancel,{method:"POST"})).json();E={...E,pendingDeletionAtIso:p.pendingDeletionAtIso},Ye(),k("Deletion cancelled. Your data is safe.","ok")}catch(u){console.error(u),k("Could not cancel. Try again.","error")}finally{G.disabled=!1}})()});for(let u of ue){let p=c("button","team-editor-swatch");p.type="button",p.style.background=u.hex,p.title=u.name,p.setAttribute("aria-label",`${u.name} jersey`),p.addEventListener("click",()=>{E={...E,colourId:u.id};for(let $t of Array.from(w.children))$t.setAttribute("aria-pressed",$t===p?"true":"false");Te()}),w.append(p)}let dr=()=>{for(let[u,p]of Array.from(w.children).entries())p.setAttribute("aria-pressed",u===E.colourId?"true":"false")};l.addEventListener("change",()=>{E={...E,teamKey:l.value},k(""),Te()});let we=()=>{e.hidden=!0};return o.addEventListener("click",we),e.addEventListener("click",u=>{u.target===e&&we()}),document.addEventListener("keydown",u=>{u.key==="Escape"&&!e.hidden&&we()}),z.addEventListener("click",()=>{(async()=>{z.disabled=!0,k("Saving...");try{let p=await(await fetch(y.TeamIdentitySave,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({teamKey:E.teamKey,teamColourId:E.colourId})})).json();if(!p.saved){k(p.error??"That name can't be used.","error");return}E={...E,teamKey:p.teamKey,colourId:p.teamColourId},l.value=p.teamKey,Te(),k("Team saved.","ok"),Rn?.(p.teamKey,p.teamColourId),window.setTimeout(we,900)}catch(u){console.error(u),k("Could not save. Try again.","error")}finally{z.disabled=!1}})()}),Object.assign(e,{open(u){E=u,l.value=u.teamKey,dr(),Te(),k(""),Ye(),e.hidden=!1,l.focus()}}),e}function Nr(){return Ie||(Ie=Ir(),document.body.append(Ie)),Ie}async function mt(e){Rn=e??null;let t=Nr();try{let r=await(await fetch(y.PlayerProfileGet,{method:"GET"})).json();t.open({teamKey:r.teamKey,colourId:r.teamColourId,pendingDeletionAtIso:r.pendingDeletionAtIso})}catch{t.open({teamKey:"",colourId:0,pendingDeletionAtIso:null})}}async function Ne(){try{let e=await fetch(y.PlayerProfileGet,{method:"GET"});if(!e.ok)return null;let t=await e.json();return t.signedIn&&ot(t.soundMuted===!0),t}catch{return null}}var Ar={"coming-back":"Coming back","every-format":"Every format","under-pressure":"Under pressure","around-the-club":"Around the club",depth:"Depth"},kr=["coming-back","every-format","under-pressure","around-the-club","depth"],b=null;function R(e){return document.getElementById(e)}function Mr(e){if(!e||!/^\d{8}$/u.test(e))return"Unlocked";let t=Number.parseInt(e.slice(4,6),10);return`Unlocked ${Number.parseInt(e.slice(6,8),10)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][t-1]??""}`.trim()}function _r(){let e=R("club-card");if(!e||!b)return;if(!b.signedIn){e.classList.add("hidden");return}e.classList.remove("hidden");let t=R("club-colour"),n=R("club-team"),r=R("club-user"),o=R("club-streak"),i=R("club-badges"),l=R("club-chases");t&&(t.style.background=b.teamKey?$(b.teamColourId).hex:"rgba(255, 241, 207, 0.28)"),n&&(n.textContent=ve(b.teamKey)||"No team yet"),r&&(r.textContent=b.teamKey?b.badge?.label||(b.username??""):"Set a name and colour"),o&&(o.textContent=String(b.currentStreak)),i&&(i.textContent=`${Se(b.achievements)}/${le.length}`),l&&(l.textContent=String(b.chasesCompleted??b.chases??0))}function Dr(){let e=R("achievements-scroll"),t=R("achievements-progress");if(!e||!b)return;let n=Se(b.achievements);t&&(t.textContent=`${n} of ${le.length} unlocked`+(b.currentStreak>0?` \xB7 ${b.currentStreak}-day streak, best ${b.bestStreak}`:"")),e.replaceChildren();for(let r of kr){let o=le.filter(f=>f.group===r);if(o.length===0)continue;let i=document.createElement("p");i.className="achievements-group",i.textContent=Ar[r],e.append(i);let l=document.createElement("div");l.className="achievements-grid";for(let f of o){let g=(b.achievements&1<<f.index)!==0,C=document.createElement("div");C.className=g?"achievement-tile is-unlocked":"achievement-tile";let w=document.createElement("strong");w.textContent=f.name;let M=document.createElement("span");M.textContent=g?Mr(b.unlockedOn[f.index]):f.goal??"Not yet",C.append(w,M),l.append(C)}e.append(l)}}async function Ae(){b=await Ne(),_r()}async function Sn(){if(!R("club-card"))return;let t=R("club-edit"),n=R("club-achievements"),r=R("achievements-close"),o=R("achievements-modal");t?.addEventListener("click",()=>{mt(()=>{Ae()})}),n?.addEventListener("click",()=>{Dr(),o?.classList.remove("hidden")}),r?.addEventListener("click",()=>o?.classList.add("hidden")),o?.addEventListener("click",i=>{i.target===o&&o.classList.add("hidden")}),await Ae()}function vn(){Ae()}function In(){return!!b?.signedIn&&!b?.teamKey}function Nn(){mt(()=>{Ae()})}var An="--app-height";var Or=new Set(["text","search","url","tel","email","password","number"]);function Me(e){return typeof e=="number"&&Number.isFinite(e)}function Pr(e){if(!e.composing||!Me(e.visualHeight))return null;let t=Me(e.restingHeight)?e.restingHeight:Me(e.layoutHeight)?e.layoutHeight:null;return t===null||t-e.visualHeight<90||e.visualHeight<120?null:Math.floor(e.visualHeight)}function Lr(e){return e instanceof HTMLTextAreaElement?!0:e instanceof HTMLInputElement?Or.has(e.type||"text"):e instanceof HTMLElement&&e.isContentEditable}var kn,Mn=null;function ke(){let e=Lr(document.activeElement),t=window.visualViewport?.height;!e&&Me(t)&&(kn=t);let n=Pr({composing:e,restingHeight:kn,layoutHeight:document.documentElement.clientHeight,visualHeight:t});n!==Mn&&(Mn=n,n===null?document.documentElement.style.removeProperty(An):document.documentElement.style.setProperty(An,`${n}px`),window.dispatchEvent(new Event("cricketrush:viewportchange")))}function _n(){let e=null,t=()=>{e!==null&&cancelAnimationFrame(e),e=requestAnimationFrame(()=>{e=null,ke()})};document.addEventListener("focusin",ke,{passive:!0}),document.addEventListener("focusout",()=>{window.setTimeout(ke,0)},{passive:!0}),window.visualViewport?.addEventListener("resize",t,{passive:!0}),window.visualViewport?.addEventListener("scroll",t,{passive:!0}),window.addEventListener("orientationchange",t,{passive:!0}),window.addEventListener("resize",t,{passive:!0}),ke()}_n();var Br=6,Jn=document.getElementById("menu-screen"),Le=document.getElementById("game-screen"),me=document.getElementById("celebration-layer"),Ur=document.getElementById("title"),Dn=document.getElementById("welcome-copy"),On=document.getElementById("target-value"),Pn=document.getElementById("target-overs-pill"),pt=document.getElementById("scenario-copy"),Ln=document.getElementById("batting-team-name"),Bn=document.getElementById("bowling-team-name"),Un=document.getElementById("batting-lineup"),$n=document.getElementById("bowling-lineup"),ft=document.getElementById("reroll-button"),ht=document.getElementById("start-button"),W=document.getElementById("game-container"),yt=document.getElementById("game-loading"),zn=document.getElementById("game-loading-copy"),J=document.getElementById("game-loading-start"),$r=document.getElementById("hud-controls-hint"),V=document.getElementById("result-include-score"),Xn=document.getElementById("result-score-prefix"),ne=document.getElementById("result-comment-input"),Fn=document.getElementById("result-comment-destination"),te=document.getElementById("result-comment-button"),Be=document.getElementById("result-composer"),Fr=document.getElementById("result-composer-cancel"),s=null,a=null,T=null,x=null,P=null,fe=!1,j=!1,F=!1,pe=null,A=!1,L=!1,$e=null,Et=!1,Gn=!1,m=null,ce=null,Tt=null,de="",_e=!1,wt=[],xt=!1,Y=null,Ct="Post Challenge as Me",Hn=["#ffcf66","#ff7b35","#a7efc1","#f9f5e7","#ffd166"],Kn=["\u{1F3CF}","\u{1F525}","\u{1F389}","\u{1F4A5}"],Qn=1200,Wn="How to play: press Space or tap to hit. Before the ball, swipe left to back away or right to step across. Time shots, keep wickets in hand, and chase before balls run out.",Gr=24;function er(e){return new Promise(t=>{window.setTimeout(t,e)})}function tr(){return new Promise(e=>{let t=()=>{J.removeEventListener("click",t),e()};J.addEventListener("click",t,{once:!0})})}function At(){return new URLSearchParams(window.location.search)}function Hr(){return At().get("flow")==="chase"}function Rt(){return At().get("flow")==="nets"}function St(e){return e.currentBalls+e.maxBallsRemaining}function Kr(e){let t=Math.trunc(e),n=Math.round((e-t)*10);return t*6+n}function Wr(e){return e.canBowl===!0||e.role==="bowler"||e.role==="all-rounder"||e.bowlerType!==void 0}function Yn(e){return _.find(n=>n.key===e)??null}function Yr(e){let t=Yn(e.battingTeamKey),n=Yn(e.bowlingTeamKey);return!t||!n?null:[t,n]}function Vr(){
  let e = At();
  if (e.get("flow") !== "create") return null;
  let type = e.get("type");
  return type === "super-over" ? { challengeType: "super-over", overs: 1 } : type === "full-match" ? { challengeType: "full-match", overs: e.get("overs") === "10" ? 10 : 5 } : null;
}function jr(e){let[t,n]=mn(_);return{id:`creator-${Date.now()}`,origin:"manual",challengeType:e.challengeType,createdAtIso:new Date().toISOString(),battingTeamKey:t.key,bowlingTeamKey:n.key,battingTeamName:t.name,bowlingTeamName:n.name,battingTeamShortName:t.shortName,bowlingTeamShortName:n.shortName,totalOvers:e.overs,target:0,currentScore:0,currentWickets:0,currentBalls:0,maxBallsRemaining:e.overs*6,...e.challengeType==="super-over"?{maxWicketsAllowed:1}:{},remainingOvers:e.overs,retiredBatters:[],striker:{name:t.players[0].name,runs:0,balls:0},nonStriker:{name:t.players[1].name,runs:0,balls:0}}}function Zr(e,t){if(!a)return{runsNeeded:0,ballsRemaining:0,requiredRate:"--"};if(m){let i=Math.max(St(a)-t,0),l=Math.max(t-a.currentBalls,0);return{runsNeeded:0,ballsRemaining:i,requiredRate:l>0?(e*6/l).toFixed(2):"0.00"}}let n=Math.max(a.target-e,0),r=Math.max(St(a)-t,0),o=n===0?"0.00":r>0?(n*6/r).toFixed(2):"\u221E";return{runsNeeded:n,ballsRemaining:r,requiredRate:o}}function Ue(e){s?.setScorecardMuted(e),s?.setAudioEnabled?.(!e)}var ee={lastBallRuns:0,bestOverRuns:0,hadDotFreeOver:!1},vt=0,Q=0,De=0,Oe=0,Pe=0;function qr(e,t){ee={lastBallRuns:0,bestOverRuns:0,hadDotFreeOver:!1},vt=e,Q=t,De=0,Oe=0,Pe=0}function Jr(e){if(e.balls<=vt){Q=Math.max(Q,Q);return}let t=Math.max(0,e.score-Q);vt=e.balls,Q=e.score,ee.lastBallRuns=t,De+=t,Pe+=1,t===0&&(Oe+=1),Pe===6&&(ee.bestOverRuns=Math.max(ee.bestOverRuns,De),Oe===0&&(ee.hadDotFreeOver=!0),De=0,Oe=0,Pe=0)}function zr(e){Jr(e),$e=e}function nr(){$e=null}function kt(){let e=window;if(!e.CricketRushEngine)throw new Error("Cricket engine bundle is unavailable.");return e.CricketRushEngine}function Vn(e,t){let n=t.retiredBatters.map(i=>({name:i.name,runs:i.runs,balls:i.balls,status:"OUT",statusClass:"lineup-status-out"})),r=[{name:t.striker.name,runs:t.striker.runs,balls:t.striker.balls,status:"STR",statusClass:"lineup-status-live"},{name:t.nonStriker.name,runs:t.nonStriker.runs,balls:t.nonStriker.balls,status:"NON",statusClass:"lineup-status-live"}],o=[...n,...r];e.replaceChildren(...o.map(i=>{let l=document.createElement("li");l.className="lineup-item";let f=document.createElement("span");f.className="lineup-name",f.textContent=i.name;let g=document.createElement("span");g.className="lineup-meta",g.textContent=`${i.runs} (${i.balls})`;let C=document.createElement("span");return C.className=`lineup-status ${i.statusClass}`,C.textContent=i.status,l.append(f,g,C),l}))}function jn(e,t){let n=t.players.filter(Wr),r=(n.length>0?n:t.players).slice(0,Br);e.replaceChildren(...r.map(o=>{let i=document.createElement("li");i.className="lineup-item lineup-item-bowler";let l=document.createElement("span");l.className="lineup-name",l.textContent=o.name;let f=document.createElement("span");return f.className="lineup-role",o.bowlerType===0?f.textContent="PACE":o.bowlerType===1?f.textContent="SPIN":o.role==="all-rounder"?f.textContent="ALL-RND":f.textContent="BOWL",i.append(l,f),i}))}function Mt(){return{tag:T?.shortName??"BAT",colour:s?.battingKitColour()??"#005f99"}}function rr(){if(!s||A||L||s.isInningsCardVisible())return;s.pause(),L=!0;let e=s.getInningsSummary(),t,n;if(Y)t="Practice nets",n=`${e.balls} ball${e.balls===1?"":"s"} faced`;else if(m||!a)t=`Setting a target \xB7 ${e.ballsLeft} ball${e.ballsLeft===1?"":"s"} left`,n=m?.challengeType==="super-over"?"Super Over":`${m?.overs??0}-over innings`;else{let r=Zr(e.score,e.balls);t=r.runsNeeded===0?`Target chased \xB7 ${r.ballsRemaining} balls left`:`Need ${r.runsNeeded} off ${r.ballsRemaining} \xB7 RRR ${r.requiredRate}`,n=`Target ${a.target}`}s.showInningsCard({kind:"pause",headline:"PAUSED",sub:t,context:n,team:Mt(),summary:e,buttons:[{label:"\u25B6 Resume",kind:"primary",onClick:()=>Z(!0)}],links:[{label:Y?"\u21BB Restart nets":m?"\u21BB Restart innings":"\u21BB Restart chase",kind:"link",onClick:()=>{Z(!1),Y?Fe(Y.preset):re()}},{label:"Sound",kind:"switch",on:!K(),onClick:r=>Ue(at(!r))},{label:"Leave match",kind:"link",onClick:Pt}],onClose:()=>Z(!0)})}function Z(e){L&&(s?.hideInningsCard(),e&&s?.resume()),L=!1}function Zn(e){return{name:e.name,players:e.players.map(t=>({name:t.name,role:t.role,canBowl:t.canBowl,bowlerType:t.bowlerType,bats:t.bats,arm:t.arm}))}}function Xr(){if(!a||!T||!x){pt.textContent="Challenge data unavailable.";return}let e=Math.max(a.target-a.currentScore,0);if(m){On.textContent="SET",Pn.textContent=`${m.overs} Over${m.overs===1?"":"s"}`,Ln.textContent=T.name,Bn.textContent=x.name,Vn(Un,a),jn($n,x),pt.textContent=m.challengeType==="super-over"?"Play one Super Over innings. Your score will set the target for other players.":`Play a complete ${m.overs}-over innings. Your score will set the chase target.`;return}On.textContent=a.target.toString(),Pn.textContent=`${a.remainingOvers} Over${a.remainingOvers===1?"":"s"} Left`,Ln.textContent=T.name,Bn.textContent=x.name,Vn(Un,a),jn($n,x),pt.textContent=a.challengeType==="super-over"?`${T.shortName} need ${e} from six balls with two wickets available.`:a.challengeType==="full-match"?`${T.shortName} need ${e} from ${a.maxBallsRemaining} balls in this ${a.totalOvers}-over chase.`:`${T.shortName} are ${a.currentScore}/${a.currentWickets} after ${dn(a.currentBalls)}. Need ${e} from ${a.maxBallsRemaining} balls against ${x.shortName}.`}function he(){Jn.classList.remove("hidden"),Le.classList.add("hidden")}function _t(){Jn.classList.add("hidden"),Le.classList.remove("hidden")}function D(e,t){t&&(zn.textContent=t),e||(yt.classList.remove("is-ready"),J.classList.add("hidden"),J.disabled=!0),yt.classList.toggle("hidden",!e)}function or(e,t){t&&(zn.textContent=t),yt.classList.toggle("is-ready",e),J.classList.toggle("hidden",!e),J.disabled=!e}function Dt(){s?.closeInningsCardSheet(),s?.hideInningsCard(),Be.classList.add("hidden"),me.replaceChildren(),pe!==null&&(window.clearTimeout(pe),pe=null)}function Qr(e){if(!m||!T||!x||!s)return;Z(!1),P=e,_e=!1;let t=e.score+1,n=m.overs*6,r=S?.username?`u/${S.username}`:"your Reddit account";s.showInningsCard({kind:"target",headline:"TARGET SET",sub:`Others need ${t} off ${n} balls`,context:m.challengeType==="super-over"?"Super Over":`${m.overs}-over innings`,team:Mt(),summary:s.getInningsSummary(),buttons:[{label:Ct,kind:"gold",onClick:()=>{io()}},{label:"\u21BB Replay innings",kind:"ghost",onClick:()=>{re()}}],note:`Posts from ${r}. Everyone who sees the post sees your username.`,links:[{label:"\u25CE Practice nets",kind:"link",onClick:()=>{Fe(null)}},{label:"Back",kind:"link",onClick:Pt}]})}function eo(){return!m||!P||!T||!x?null:m.challengeType==="super-over"?{challengeType:"super-over",creatorScore:P.score,battingTeamKey:T.key,bowlingTeamKey:x.key}:{challengeType:"full-match",overs:m.overs,creatorScore:P.score,battingTeamKey:T.key,bowlingTeamKey:x.key}}function to(){me.replaceChildren();let e=document.createDocumentFragment();for(let t=0;t<70;t++){let n=document.createElement("span");n.className="confetti-piece",n.style.left=`${Math.random()*100}%`,n.style.setProperty("--drift",`${Math.round((Math.random()-.5)*160)}px`),n.style.setProperty("--spin",`${Math.round(320+Math.random()*680)}deg`),n.style.setProperty("--fall-duration",`${2200+Math.round(Math.random()*1400)}ms`),n.style.setProperty("--fall-delay",`${Math.round(Math.random()*650)}ms`),n.style.setProperty("--piece-color",Hn[t%Hn.length]),e.append(n)}for(let t=0;t<14;t++){let n=document.createElement("span");n.className="confetti-emoji",n.textContent=Kn[t%Kn.length],n.style.left=`${4+Math.random()*92}%`,n.style.setProperty("--drift",`${Math.round((Math.random()-.5)*180)}px`),n.style.setProperty("--spin",`${Math.round(220+Math.random()*520)}deg`),n.style.setProperty("--fall-duration",`${2500+Math.round(Math.random()*1500)}ms`),n.style.setProperty("--fall-delay",`${Math.round(Math.random()*700)}ms`),e.append(n)}me.append(e),pe=window.setTimeout(()=>{me.replaceChildren(),pe=null},5200)}function no(e){if(!a||!T||!x||!s)return;if(m){Qr(e);return}Z(!1);let t=e.score>=a.target,n=e.ballsBowled??Kr(e.oversBowled),r=Math.max(St(a)-n,0),o=Math.max(a.target-e.score,0);P=e,fe||(fe=!0,lo(e));if(ne)ne.value="";if(V)V.checked=!0;j=!1;F=!1;if(te)te.textContent="";if(Xn)Xn.textContent=fn(a,e);wt=[],t?to():me.replaceChildren();let i=Math.max(10-e.wickets,0),l=s.getInningsSummary(),f=t?null:l.lastWicketBall;s.showInningsCard({kind:t?"won":"lost",headline:t?"WON":"LOST",sub:t?`by ${i} wicket${i===1?"":"s"} \xB7 ${r>0?`${r} ball${r===1?"":"s"} left`:"last ball"}`:`${o} run${o===1?"":"s"} short`,context:`Target ${a.target}`,team:Mt(),summary:l,pills:wt,buttons:[{label:"Share Score",kind:"primary",onClick:()=>{if(navigator.share){navigator.share({title:"Cricket Rush",text:`Score: ${e.score}/${e.wickets} in Cricket Rush!`}).catch(()=>{});}else{N({text:"Score saved!",appearance:"success"});}}},{label:"\u21BB Play again",kind:"ghost",onClick:()=>{re()}}],links:Ot(f),join:null}),q()}var ge=sn(),gt=!1,ar=S?.subredditName?`r/${S.subredditName}`:"r/CricketRush";function It(e){return{name:ar,line:"New chases & leaderboards",joined:ge,busy:e,onJoin:()=>{oo()}}}function Ot(e){let t=[];return xt&&t.push({label:"Create your team",kind:"link",onClick:()=>{xt=!1,s?.updateInningsCard({links:Ot(e)}),Nn()}}),t.push({label:e?"\u25CE Practise what got you out":"\u25CE Practice nets",kind:"link",onClick:()=>{Fe(e?co(e):null)}}),t.push({label:"Back",kind:"link",onClick:Pt}),t}function ro(){!s||F||(Be.classList.remove("hidden"),s.openInningsCardSheet(Be),q(),ne.focus())}function ir(){s?.closeInningsCardSheet(),Be.classList.add("hidden")}async function oo(){if(gt||ge)return;gt=!0,s?.updateInningsCard({join:It(!0)});let e=await un();gt=!1,e?ge=!0:N({text:"Couldn't join right now. Please try again.",appearance:"neutral"}),s?.updateInningsCard({join:It(!1)})}function ao(){if(Fn){Fn.classList.remove("is-top-level"),Fn.textContent=""}}function q(){if(!V||!ne||!te)return;let e=V.checked||ne.value.trim().length>0;Xn&&(Xn.hidden=!V.checked),ao(),te.disabled=!P||!e||j||F,V.disabled=j||F,ne.disabled=j||F}async function io(){if(!m||!P||!T||!x||_e)return;let e=eo();if(!e)return;_e=!0;let t=s?.inningsCardButton(Ct)??null;t&&(t.disabled=!0,t.textContent="Posting...");try{let n=await fetch(y.ChallengeCreatePost,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!n.ok){let o="Failed to post challenge. Nothing was posted.";try{let i=await n.json();typeof i.error=="string"&&i.error.length<=240&&(o=i.error)}catch{}throw new Error(o)}let r=await n.json();N({text:Xt("Challenge",r),appearance:"success"}),se(r.postUrl)}catch(n){console.error(n),N({text:n instanceof Error?n.message:"Failed to post challenge. Nothing was posted.",appearance:"neutral"}),_e=!1,t&&(t.disabled=!1,t.textContent=Ct)}}function so(e){let t=[],[n,...r]=e.unlocked;n&&t.push({text:`\u{1F3C5} ${n.name}${r.length>0?` +${r.length}`:""}`,tone:"gold"}),e.streakDays>0&&t.push({text:e.streakExtended?`\u{1F525} Streak now ${e.streakDays} day${e.streakDays===1?"":"s"}`:`\u{1F525} ${e.streakDays}-day streak`,tone:"blue"}),wt=t,s?.updateInningsCard({pills:t})}async function lo(e){try{let t=await fetch(y.ChallengeRecordResult,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...e,ballDetail:ee})});if(!t.ok)throw new Error(`result recording failed: ${t.status}`);let n=await t.json();if(n.type!=="challenge-result-recorded"||!n.recorded)throw new Error("unexpected result-recording response");n.progress&&so(n.progress),vn(),!Gn&&In()&&s?.isInningsCardVisible()&&(Gn=!0,xt=!0,s.updateInningsCard({links:Ot(s.getInningsSummary().lastWicketBall)}))}catch(t){fe=!1,console.error("Could not record challenge result",t)}}async function uo(){if(!P||j||F)return;let e=ne.value.trim();if(!V.checked&&!e){N({text:"Include the score or write a comment before posting.",appearance:"neutral"});return}j=!0,q(),te.textContent="Posting...";try{let t=await fetch(y.ChallengeCommentAsUser,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...P,includeScore:V.checked,commentText:e})});if(!t.ok)throw new Error(`user comment failed: ${t.status}`);let n=await t.json();if(n.commentUrl){F=!0,te.textContent="Score Posted",ir();let r=s?.inningsCardButton("Post score");r&&(r.textContent="Score posted",r.disabled=!0),N({text:n.commentDestination==="top-level"?"Posted as your top-level comment on this post.":"Posted as your reply in the stickied score thread.",appearance:"success"})}else N({text:"No score comment was created.",appearance:"neutral"})}catch(t){console.error(t),N({text:"Could not post your comment. Nothing was posted.",appearance:"neutral"})}finally{j=!1,F||(te.textContent="Post Score as Me"),q()}}function be(){D(!1),Z(!1),s?.destroy(),s=null,W.replaceChildren(),$e=null,nr()}
// ── Communication with Parent Window (index.html) ──
window.addEventListener("message", function(e) {
  if (!e.data) return;
  if (e.data.type === "toggle-sound") {
    Ue(at(Boolean(e.data.muted)));
  } else if (e.data.type === "set-difficulty") {
    const diff = e.data.difficulty || "medium";
    localStorage.setItem("cricket-rush:difficulty", diff);
    const lvl = diff === "easy" ? 0 : diff === "hard" ? 2 : 1;
    s?.setDifficulty?.(lvl);
  } else if (e.data.type === "set-graphics") {
    const q = e.data.quality || "medium";
    localStorage.setItem("cricket-rush:graphics-quality", q);
    // Reload match with updated quality
    re();
  }
});

function playSynthesizedSFX(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!window._sfxCtx) window._sfxCtx = new AudioCtx();
    const ctx = window._sfxCtx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    if (type === "tap" || type === "meter") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "hit" || type === "four") {
      // Crisp willow bat strike
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(type === "four" ? 950 : 820, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "six") {
      // Big power strike with deep sub + crowd roar swell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
      if (typeof window.triggerConfetti === "function") window.triggerConfetti();
    } else if (type === "wicket" || type === "bowled") {
      // Heavy timber stump rattle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "coin") {
      // Metallic coin flip chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "win") {
      // Triumphant brass fanfare
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.28);
      });
      if (typeof window.triggerConfetti === "function") window.triggerConfetti();
    }
  } catch(e) {}
}

function triggerHaptic(type) {
  playSynthesizedSFX(type);
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      if (type === "six") navigator.vibrate([50, 40, 100]);
      else if (type === "four") navigator.vibrate([40, 30, 40]);
      else if (type === "hit") navigator.vibrate(25);
      else if (type === "wicket") navigator.vibrate([120, 60, 200]);
    } catch(err) {}
  }
}

function showShotFeedback(text, tone) {
  const badge = document.getElementById("shot-feedback-badge");
  if (!badge) return;
  badge.textContent = text;
  badge.style.borderColor = tone === "six" ? "#ffcf66" : tone === "four" ? "#a7efc1" : tone === "wicket" ? "#ff7b35" : "#fff1cf";
  badge.style.color = badge.style.borderColor;
  badge.classList.add("active");
  clearTimeout(badge._timer);
  badge._timer = setTimeout(() => badge.classList.remove("active"), 1600);
}

async function re(e={}){
  if (A) return;
  if (!a || !T || !x) {
    N({text: "Challenge is still loading.", appearance: "neutral"});
    return;
  }
  A = !0; Y = null; fe = !1; Et = !1;
  qr(a.currentBalls, a.currentScore);
  let t = performance.now();
  Dt(); be(); _t();
  let n = e.loadingMessage ?? "Setting up stadium and match...";
  D(!0, n);
  updateLoadingProgress(15, "Setting up 3D turf & stadium lighting...");
  let r = null;
  try {
    let o = kt();
    r = new o.CricketGame(W, {
      onInningsEnd: g => {
        if (window.fullMatchManager && window.fullMatchManager.active) {
          window.fullMatchManager.handleInningsComplete(g);
          return;
        }
        if (window.testMatchManager && window.testMatchManager.active) {
          window.testMatchManager.handleInningsEnd();
          return;
        }
        no(g);
      },
      onHudUpdate: g => { zr(g); },
      onBoundary: b => {
        triggerHaptic(b.runs === 6 ? "six" : "four");
        const dist = b.runs === 6 ? `${Math.round(66 * Math.sqrt(Math.max(1, b.landingDistSq || 1)) + 12)}m` : "";
        const title = b.runs === 6 ? `SIX! ${dist}` : `FOUR! Boundary`;
        showShotFeedback(`🏏 ${title}`, b.runs === 6 ? "six" : "four");
        // special event recorded
        if (window.commentaryEngine) window.commentaryEngine.say(b.runs === 6 ? "six" : "four");
        try {
          window.parent.postMessage({
            type: "boundary-hit",
            runs: b.runs,
            distance: dist,
            score: $e?.score || 0
          }, "*");
        } catch(err) {}
      },
      onWicket: (batter, how) => {
        triggerHaptic("wicket");
        if (window.bowlingManager && window.bowlingManager.active) {
          window.bowlingManager.onBallResult(0, true, how || "Out");
        }
        if (window.lanManager && window.lanManager.active) {
          window.lanManager.handleLocalBallComplete(0, true, how || "Out");
        }
        if (window.testMatchManager && window.testMatchManager.active) {
          window.testMatchManager.onBallCompleted(0, true);
        }
        const title = `WICKET! ${batter?.name || "Batsman"} ${how || "Out"}`;
        showShotFeedback(`💥 ${title}`, "wicket");
        // special event recorded
        if (window.commentaryEngine) window.commentaryEngine.say("wicket");
        if (window.drsManager && (how === "LBW" || how === "Caught Behind" || Math.random() < 0.25)) {
          window.drsManager.startReview({
            type: how === "LBW" ? "lbw" : "caught",
            isOut: true
          });
        }
        try {
          window.parent.postMessage({
            type: "wicket-fallen",
            batter: batter?.name,
            how: how,
            wickets: $e?.wickets || 0
          }, "*");
        } catch(err) {}
      },
      onBallComplete: runs => {
        if (runs > 0 && runs < 4) triggerHaptic("hit");
        if (window.bowlingManager && window.bowlingManager.active) {
          window.bowlingManager.onBallResult(runs, false, "");
        }
        if (window.lanManager && window.lanManager.active) {
          window.lanManager.handleLocalBallComplete(runs, false, "");
        }
        if (window.testMatchManager && window.testMatchManager.active) {
          window.testMatchManager.onBallCompleted(runs, false);
        }
        if (window.careerStats) {
          window.careerStats.recordShot({ angle: (Math.random() - 0.5) * 160, runs: runs });
        }
        try {
          window.parent.postMessage({
            type: "ball-completed",
            runsThisBall: runs,
            score: $e?.score || 0,
            balls: $e?.balls || 0,
            wickets: $e?.wickets || 0
          }, "*");
        } catch(err) {}
      }
    }, !K(), sr());
    s = r;
    Lt(r);
    r.setScorecardTeam(T.shortName, null);

    updateLoadingProgress(45, "Loading cricketer 3D models & rigging...");
    let i = { done: !1, error: null };
    let l = (async () => {
      try {
        if (typeof r?.warmup === "function") {
          await Promise.race([r.warmup(), new Promise(res => setTimeout(res, 2000))]);
        }
      } catch (g) {
        i.error = g;
      } finally {
        i.done = !0;
      }
    })();

    updateLoadingProgress(75, "Loading animation clips (58 clips)...");
    try {
      await Promise.race([l, new Promise(res => setTimeout(res, 250))]);
    } catch(err) {}
    if (s !== r) return;
    updateLoadingProgress(100, "Match Ready!");
    D(!1);
    if (i.error) throw i.error;

    const diff = At().get("difficulty") || localStorage.getItem("cricket-rush:difficulty") || "medium";
    const skillLevel = diff === "easy" ? o.PlayerSkillLevel.BEGINNER : diff === "hard" ? o.PlayerSkillLevel.PRO : o.PlayerSkillLevel.CLUB;
    let f = { battingTeam: Zn(T), bowlingTeam: Zn(x), totalOvers: a.totalOvers, playerSkillLevel: skillLevel };
    const isFirstInnings = (a.challengeType === "full-match" || a.challengeType === "test-match" || m?.challengeType === "full-match") && (a.target === null || a.target === undefined);
    if (isFirstInnings) {
      r.startInnings({
        ...f,
        type: o.InningsType.FIRST_INNINGS,
        format: a.challengeType || "full-match",
        strikerInfo: { name: a.striker?.name || T.players[0]?.name || "Striker", runs: 0, balls: 0 },
        nonStrikerInfo: { name: a.nonStriker?.name || T.players[1]?.name || "Non-Striker", runs: 0, balls: 0 },
        retiredBatters: []
      });
    } else {
      r.startInnings({
        ...f,
        type: (a.challengeType === "full-match" || a.challengeType === "test-match") ? o.InningsType.CHASE : o.InningsType.CHALLENGE,
        format: m ? m.challengeType : a.challengeType,
        ...(a.target !== null && a.target !== undefined ? { target: a.target } : {}),
        currentScore: a.currentScore || 0,
        currentWickets: a.currentWickets || 0,
        currentBalls: a.currentBalls || 0,
        strikerInfo: { name: a.striker?.name || T.players[0]?.name || "Striker", runs: a.striker?.runs || 0, balls: a.striker?.balls || 0 },
        nonStrikerInfo: { name: a.nonStriker?.name || T.players[1]?.name || "Non-Striker", runs: a.nonStriker?.runs || 0, balls: a.nonStriker?.balls || 0 },
        retiredBatters: (a.retiredBatters || []).map(g => ({ name: g.name, runs: g.runs, balls: g.balls, isOut: g.isOut })),
        maxBallsRemaining: a.maxBallsRemaining,
        ...(a.maxWicketsAllowed !== void 0 ? { maxWicketsAllowed: a.maxWicketsAllowed } : {})
      });
    }
    U({ kind: "played", challengeType: ct(a.challengeType, a.totalOvers), loadMs: Math.round(performance.now() - t) });
  } catch(o) {
    console.error("game start failed", o);
    N({ text: "Failed to start match. Please try again.", appearance: "neutral" });
    r && s === r ? (be(), he()) : (D(!1), he());
  } finally {
    r && s === r && D(!1);
    A = !1;
  }
}
function updateLoadingProgress(percent, stage) {
  const bar = document.getElementById("loading-bar-fill");
  const pctLabel = document.getElementById("loading-percent-label");
  const stageLabel = document.getElementById("loading-stage-label");
  if (bar) bar.style.width = percent + "%";
  if (pctLabel) pctLabel.textContent = percent + "%";
  if (stageLabel && stage) stageLabel.textContent = stage;
}

function sr() {
  const q = At().get("quality") || localStorage.getItem("cricket-rush:graphics-quality") || "medium";
  const use3d = q === "low" ? false : rn();
  const maxDpr = q === "low" ? 0.75 : q === "high" ? 1.5 : 1.0;
  const maxFps = q === "low" ? 30 : 60;
  return {
    characters: use3d,
    maxDpr: maxDpr,
    maxFps: maxFps,
    onCharactersOff: () => on(),
    onCharactersReport: t => yn("game", t),
    scorecard: { onPause: rr, onMute: t => Ue(at(t)), muted: K() }
  };
}function co(e){let t=kt().BowlerArchetype[e.archetype];return{...typeof t=="string"?{bowler:t}:{},lengths:[e.length],lines:[e.line]}}async function Fe(e){if(A)return;A=!0,Dt(),be(),Y={preset:e},_t(),D(!0,"Setting up the nets. Pick the bowler and the balls you want with the setup button.");let t=null;try{let n=kt();if(t=new n.CricketGame(W,{},!K(),sr()),s=t,Lt(t),t.setScorecardTeam(T?.shortName??"YOU",null),await Promise.race([t.warmup?.()??Promise.resolve(),er(Qn)]),s!==t||(or(!0),await tr(),s!==t))return;let r=a&&!Rt()?{onExit:()=>{re()}}:{};t.startPracticeNets({...e?{preset:e}:{},...r},n.PlayerSkillLevel.CLUB)}catch(n){console.error("nets start failed",n),N({text:"Failed to open the nets. Please try again.",appearance:"neutral"}),t&&s===t&&be(),he()}finally{t&&s===t&&D(!1),A=!1}}function lr(e){if(!s||Y||Et||fe||m||!a)return;Et=!0;let t=Math.max(0,($e?.balls??a.currentBalls)-a.currentBalls),n={kind:"quit",challengeType:ct(a.challengeType,a.totalOvers),oversFaced:Math.floor(t/6)};e?gn(n):U(n)}function Pt(){lr(!1),A=!1,D(!1),Dt(),be(),he()}function mo(e){if(e.code==="Escape"&&!Le.classList.contains("hidden")){e.preventDefault(),L?Z(!0):s?.isInningsCardVisible()||rr();return}if(e.code==="ArrowLeft"||e.code==="ArrowRight"||e.code==="ArrowDown"){if(Le.classList.contains("hidden")||A||L)return;e.preventDefault(),s?.setStance?.(e.code==="ArrowLeft"?-1:e.code==="ArrowRight"?1:0);return}if(e.code==="Space"){
  if(window.bowlingManager && window.bowlingManager.meterRunning){
    e.preventDefault();
    window.bowlingManager.handleRelease();
    return;
  }
  let t=e.target;if(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLElement&&t.isContentEditable||(e.preventDefault(),A||L||s?.isInningsCardVisible()))return;s?.action()}}var O = null;
var hasTriggeredShot = false;

function po(e) {
  if (window.bowlingManager && window.bowlingManager.meterRunning) {
    e.preventDefault();
    window.bowlingManager.handleRelease();
    return;
  }
  if (A || L || s?.isInningsCardVisible() || e.target?.closest("button")) return;
  e.preventDefault();
  hasTriggeredShot = false;
  O = { id: e.pointerId, x: e.clientX, y: e.clientY, time: performance.now() };
}

function fo(e) {
  if (!O || e.pointerId !== O.id || A || L || hasTriggeredShot) return;
  let dx = e.clientX - O.x;
  let dy = e.clientY - O.y;
  let dist = Math.hypot(dx, dy);

  if (dist >= 24) {
    hasTriggeredShot = true;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;

    if (angle >= -135 && angle < -45) {
      // Swipe UP: Straight Drive / Lofted hit
      s?.setStance?.(0);
      s?.action();
      showShotFeedback("⚡ STRAIGHT DRIVE", "six");
    } else if (angle >= -45 && angle < 45) {
      // Swipe RIGHT: Leg-side Pull / Hook / Flick
      s?.setStance?.(1);
      s?.action();
      showShotFeedback("🎯 PULL / FLICK", "four");
    } else if (angle >= 45 && angle < 135) {
      // Swipe DOWN: Defensive Block / Leave
      s?.setStance?.(0);
      s?.action();
      showShotFeedback("🛡️ DEFENSIVE BLOCK", "hit");
    } else {
      // Swipe LEFT: Off-side Cover Drive / Cut
      s?.setStance?.(-1);
      s?.action();
      showShotFeedback("🏏 COVER DRIVE / CUT", "six");
    }
    triggerHaptic("hit");
  }
}

function qn(e) {
  if (!O || e.pointerId !== O.id) return;
  if (!hasTriggeredShot && !A && !L && !s?.isInningsCardVisible()) {
    s?.action();
    showShotFeedback("⚡ TIMED STROKE", "hit");
    triggerHaptic("hit");
  }
  O = null;
  hasTriggeredShot = false;
}function ho(e){if(!de)return e;let t=de,n=e.bowlingTeamKey===de?wn(e.bowlingTeamKey,de):e.bowlingTeamKey,r=_.find(i=>i.key===t),o=_.find(i=>i.key===n);return!r||!o?e:{...e,battingTeamKey:t,bowlingTeamKey:n,battingTeamName:r.name,bowlingTeamName:o.name,battingTeamShortName:r.shortName,bowlingTeamShortName:o.shortName}}function Nt(e){let t=ho(cn(e)),n=Yr(t);if(!n)throw new Error("Challenge refers to unknown league teams.");let[r,o]=n;a=t,T=r,x=o,Xr(),nr()}function Lt(e){if(!e.setKitColors)return;let t=Tt===null?null:$(Tt).hex,n=ce===null?null:$(ce).hex,r=t!==null&&t===n&&ce!==null;e.setKitColors(t,r?$(Tn(ce)).hex:n)}async function bt(){try{let e=await fetch(y.ChallengeCurrent,{method:"GET"});if(!e.ok)throw new Error(`challenge fetch failed: ${e.status}`);let t=await e.json();if(!t.challenge)throw new Error("challenge payload missing");return ce=t.creator?t.creator.colourId:null,Nt(t.challenge),!0}catch(e){return console.error(e),N({text:"Failed to load challenge.",appearance:"neutral"}),!1}}

// ============================================================================
// MODES ARE NOW IMPORTED AS MODULAR ES6 SCRIPTS FROM modes/:
// - modes/toss.js: TossManager (Interactive coin flip animation)
// - modes/bowling.js: BowlingModeManager (Pace/Spin, line, length, timed release)
// - modes/match.js: FullMatchManager (Single-Player full match, bat & bowl)
// - modes/lan.js: LANMultiplayerManager (Turn-based Wi-Fi multiplayer)
// - modes/test.js: TestMatchManager (2 innings each, sessions, declare, Quick Sim)
// - modes/extras.js: Career stats, wagon wheel, settings, pause, Web Share
// ============================================================================
// ============================================================================
// MAIN INITIALIZATION & GAME ROUTER
// ============================================================================
function go() {
  m = Vr();
  const params = At();
  const flow = params.get("flow") || "";
  let isBowling = flow === "bowling";
  let isLan = flow === "multiplayer" || params.get("lan") === "1" || !!params.get("room");
  let isMatch = flow === "match" || flow === "full-match";
  let isTest = flow === "test";
  let isTourn = flow === "tournament" || flow === "cup";

  let isSuperOver = flow === "super-over";

  let isCustom = flow === "custom";

  let isDaily = flow === "daily";

  let isChase = flow === "chase" || Hr();

  let e = isChase || Rt() || isBowling || isLan || isMatch || isTest || isTourn || isSuperOver || isCustom || isDaily || !!m;

  Ur.textContent = "Cricket Rush";
  Dn.textContent = m ? `${S?.username??"Captain"}, play the innings that will set your challenge target.` : "Step into a late-innings finish and close out the match.";
  
  if (e) {
    _t();
    D(!0, Wn);
  }

  ft.textContent = m ? "Cancel Creation" : "Refresh Challenge";
  ft.addEventListener("click", () => {
    if (m) {
      m = null;
      window.history.replaceState(null, "", window.location.pathname);
      ft.textContent = "Refresh Challenge";
      ht.textContent = "Start Challenge";
      Dn.textContent = "Step into a late-innings finish and close out the match.";
      bt();
      return;
    }
    bt();
  });

  ht.addEventListener("click", () => { re(); });

  // ?? 1v1 PvP LAN / Code Match Buttons
  document.getElementById("btn-menu-host-room")?.addEventListener("click", () => {
    _t();
    window.lanManager?.startMultiplayerFlow({ tab: "host" });
  });
  document.getElementById("btn-menu-join-room")?.addEventListener("click", () => {
    _t();
    window.lanManager?.startMultiplayerFlow({ tab: "join" });
  });

  // ?? Game Modes Hub Buttons
  document.getElementById("btn-mode-match")?.addEventListener("click", () => {
    _t();
    window.fullMatchManager?.startMatchFlow({ overs: 2, wickets: 5, diff: "medium" });
  });
  document.getElementById("btn-mode-bowling")?.addEventListener("click", () => {
    _t();
    window.bowlingManager?.startBowlingMode();
  });
  document.getElementById("btn-mode-tournament")?.addEventListener("click", () => {
    _t();
    window.tournamentManager?.startTournamentFlow({ overs: 2 });
  });
  document.getElementById("btn-mode-test")?.addEventListener("click", () => {
    _t();
    window.testMatchManager?.startTestMatchFlow(false);
  });
  document.getElementById("btn-mode-superover")?.addEventListener("click", () => {
    a = {
      ...a,
      challengeType: "super-over",
      totalOvers: 1,
      target: 19,
      currentScore: 0,
      currentWickets: 0,
      currentBalls: 0,
      maxBallsRemaining: 6,
      maxWicketsAllowed: 2
    };
    re();
  });
  document.getElementById("btn-mode-nets")?.addEventListener("click", () => {
    Fe(null);
  });
  Ue(K());
  Sn();

  Ne().then(t => {
    Tt = t?.signedIn && t.teamKey ? t.teamColourId : null;
    de = t?.signedIn ? t.teamKey : "";
    a && Nt(a);
    s && Lt(s);
    Ue(K());
  });

  window.addEventListener("keydown", mo);
  window.addEventListener("pagehide", () => lr(!0));
  W.addEventListener("pointerdown", po);
  W.addEventListener("pointermove", fo);
  W.addEventListener("pointerup", qn);
  W.addEventListener("pointercancel", qn);
  q();

  $r.textContent = "Tap or Space to hit. Before the ball, swipe left to back away, right to step across.";

  if (!e) D(!1);

  (async () => {
    if (Rt()) {
      await Fe(null);
      return;
    }

    const params = At();
    const flow = params.get("flow") || "";
    const isBowlingFlow = flow === "bowling" || isBowling;
    const isLanFlow = flow === "multiplayer" || isLan;
    const isFullMatchFlow = flow === "match" || flow === "full-match";
    const isTestFlow = flow === "test";
    const isTournamentFlow = flow === "tournament" || flow === "cup";

    // ── 1. Bowling Mode (Standalone / Custom) ──
    if (isBowlingFlow) {
      const batTeam = _.find(t => t.key === "jaipur-jets") || _[0];
      const bowlTeam = _.find(t => t.key === "punjab-pulse") || _[1];
      T = batTeam;
      x = bowlTeam;
      const customTarget = parseInt(params.get("target"), 10) || 12;
      const customBalls = parseInt(params.get("balls"), 10) || 6;
      a = {
        battingTeamKey: batTeam.key,
        bowlingTeamKey: bowlTeam.key,
        battingTeamName: batTeam.name,
        bowlingTeamName: bowlTeam.name,
        battingTeamShortName: batTeam.shortName,
        bowlingTeamShortName: bowlTeam.shortName,
        challengeType: "death-over",
        totalOvers: Math.ceil(customBalls / 6),
        target: customTarget,
        currentScore: 0,
        currentWickets: 0,
        currentBalls: 0,
        maxBallsRemaining: customBalls,
        maxWicketsAllowed: customBalls > 6 ? 4 : 2,
        striker: { name: batTeam.players[0].name, runs: 0, balls: 0 },
        nonStriker: { name: batTeam.players[1].name, runs: 0, balls: 0 },
        retiredBatters: []
      };
      await re({ loadingMessage: `Setting up Bowling Defense (Defend ${customTarget} off ${customBalls})...` });
      window.bowlingManager?.startBowlingMode({ target: customTarget, totalBalls: customBalls });
      return;
    }

    // ── 2. LAN 1v1 Multiplayer ──
    if (isLanFlow) {
      _t();
      D(!1);
      const roomParam = params.get("room") || "";
      window.lanManager?.startMultiplayerFlow(roomParam);
      return;
    }

    // 3. Single-Player Full Match (Bat & Bowl)
    if (isFullMatchFlow) {
      _t();
      D(!1);
      const oversParam = parseInt(params.get("overs"), 10) || 2;
      const wktsParam = parseInt(params.get("wickets"), 10) || 5;
      const diffParam = params.get("diff") || "medium";
      window.fullMatchManager?.startMatchFlow({ overs: oversParam, wickets: wktsParam, diff: diffParam });
      return;
    }

    // 4. Test Match Mode
    if (isTestFlow) {
      _t();
      D(!1);
      window.testMatchManager?.startTestMatchFlow(false);
      return;
    }

    // 5. Premier Cup Tournament
    if (isTournamentFlow) {
      _t();
      D(!1);
      const teamParam = params.get("team") || "punjab-pulse";
      const oversParam = parseInt(params.get("overs"), 10) || 2;
      window.tournamentManager?.startTournamentFlow({ teamKey: teamParam, overs: oversParam });
      return;
    }

    // ── 5. Standard Challenge / Super Over / Daily ──
    let t = !1;
    if (m) {
      Nt(jr(m));
      ht.textContent = m.challengeType === "super-over" ? "Start Super Over" : `Start ${m.overs}-Over Innings`;
      t = !0;
    } else {
      t = await bt();
    }

    if (!!e) {
      if (!t) {
        D(!1);
        he();
        return;
      }
      await re({ loadingMessage: Wn });
    }
  })();
}

go();
