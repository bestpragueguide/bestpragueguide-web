import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const maxDuration = 300

// Helper for richText (minimal Lexical format) — supports multi-paragraph
function richText(text: string) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return {
    root: {
      type: 'root',
      children: paragraphs.map(p => ({
        type: 'paragraph',
        children: [{ type: 'text', text: p.trim(), format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function slugify(title: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j',
    'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
    'х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  }
  return title.toLowerCase()
    .split('')
    .map(c => map[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

function parseDuration(dur: string): number {
  if (!dur) return 3
  const match = dur.match(/(\d+)/);
  return match ? parseInt(match[1]) : 3
}

function getCategory(title: string, duration: number): 'prague-tours' | 'day-trips-from-prague' {
  const dayTripKeywords = ['Дрезден', 'Крумлов', 'Карлов', 'Кутна Гора', 'Штернберг', 'Конопишт',
    'Карлштейн', 'Кршивоклат', 'Мельник', 'Блатна', 'Глубока', 'Крушовице', 'Марианские', 'Локет']
  if (dayTripKeywords.some(kw => title.includes(kw))) return 'day-trips-from-prague'
  if (duration >= 6 && !title.toLowerCase().includes('прага') && !title.toLowerCase().includes('пражск')) return 'day-trips-from-prague'
  return 'prague-tours'
}

interface TourData {
  title: string
  duration: string
  description: string
  images: string[]
  category?: string
}

const TOURS: TourData[] = [
  {title:"Вся Прага за 1 день - Для тех, кто хочет увидеть всё и сразу!",duration:"6 часов",description:"Откройте для себя всё, за что влюбляются в Прагу — за один день. Это не просто экскурсия, а полное погружение в душу города: история, легенды и потрясающие виды в каждом шаге.\n\nЧто вас ждёт:\n\nСтарый город — легендарные Астрономические часы, уютные средневековые улочки, тайные дворики.\nКарлов мост — с его мистикой, скульптурами и невероятными видами.\nМала Страна — романтика барокко, старинные домики, тишина и сказочная атмосфера.\nПражский Град — главная чешская крепость с готическим собором святого Вита.\nВышеград — старейшая легендарная часть города, с захватывающими панорамами.\nПанорамные виды на красавицу Прагу, великолепные парки, тайные лестницы и дворики.",images:["https://static.tildacdn.com/stor3432-3533-4835-b866-623533326565/17733649.jpg","https://static.tildacdn.com/tild3963-3634-4434-b930-383230363736/107415985_3379379505.jpg","https://static.tildacdn.com/stor3731-3038-4631-b361-353533646430/81189483.jpg","https://static.tildacdn.com/stor3163-6666-4865-a565-623136313032/29979250.jpg"]},
  {title:"Мистическая Прага 3 в 1",duration:"2 часа",description:"Одна из самых популярных, интересных и необычных экскурсий, которая впечатлит и детей и взрослых!\n\nПогрузитесь в мистическую атмосферу Праги на уникальной экскурсии, где легенды, подземелья и алхимические тайны сплетаются в захватывающее приключение!\n\nМы начнём с прогулки по загадочным улочкам Старого города. Далее — подземный мир, скрывающий романскую и готическую архитектуру. И наконец, дом алхимиков откроет вам свои секреты!",images:["https://static.tildacdn.com/tild6134-6361-4838-a236-623030383362/prague-1168302-1920.jpeg","https://static.tildacdn.com/stor6461-6164-4133-a165-663134623331/46317366.jpg","https://static.tildacdn.com/stor3363-6665-4166-b239-623034326366/53453566.jpg","https://static.tildacdn.com/stor6461-3339-4031-a234-386137636136/50883936.jpg"]},
  {title:"Прага за 3 часа — обзорная экскурсия",duration:"3 часа",description:"Откройте для себя лучшее в Праге за 3 часа! Погрузитесь в атмосферу волшебного города на увлекательной авторской экскурсии. Вы увидите все главные достопримечательности Праги.\n\nМы посетим знаменитый Карлов мост, Староместскую площадь с астрономическими часами, Пражский Град с собором Святого Вита. С Пражского Града мы насладимся потрясающим видом на реку Влтаву, пражские мосты и холм Петршин.",images:["https://static.tildacdn.com/tild3331-6264-4964-b332-633234643431/67317484_25355524664.jpg","https://static.tildacdn.com/tild3963-3634-4434-b930-383230363736/107415985_3379379505.jpg","https://static.tildacdn.com/tild3264-3733-4839-b764-303832303732/117104599_3464024216.jpg","https://static.tildacdn.com/tild6432-3333-4431-b237-613833323965/78955674_28233943710.jpg"]},
  {title:"Волшебная Прага для детей и их родителей",duration:"2 часа",description:"Эта экскурсия создана специально для семей с детьми, чтобы открыть для вас волшебную, уютную и вкусную Прагу! Мы будем гулять по средневековым улочкам, узнавать пражские легенды и тайны, лакомиться знаменитым трдельником.\n\nНа Староместской площади вы увидите бой старейших в мире действующих астрономических часов. Прогулка приведёт нас через секретные переулки и дворики Старого города к Карлову мосту, где мы загадаем наши самые заветные желания.",images:["https://static.tildacdn.com/stor6232-6336-4635-a166-336431653032/36879197.jpg","https://static.tildacdn.com/stor3437-6534-4165-a535-333335353063/83568871.jpg","https://static.tildacdn.com/stor3265-3434-4637-b735-656162376536/69671768.jpg","https://static.tildacdn.com/stor6361-6534-4761-b036-353732613562/65085608.jpg"]},
  {title:"Ужин и средневековое шоу в таверне «У Паука»",duration:"3 часа",description:"Ужин в знаменитейшей таверне «У Паука» — это настоящее «возвращение в средневековье»! Программа вечера проводится в средневековой таверне, где воссоздана обстановка давности нескольких сотен лет!\n\nРазбойники и факиры, танцовщицы и жонглёры, музыканты — все они будут вас развлекать в течение вечера. Вас порадует и традиционная чешская кухня!\n\nВ стоимость включена 2-х часовая шоу-программа, ужин из 5-ти блюд и неограниченное употребление напитков.",images:["https://static.tildacdn.com/stor3162-3135-4139-b632-653339656330/76165604.jpg","https://static.tildacdn.com/stor3534-3831-4130-b831-326430396234/23541852.jpg","https://static.tildacdn.com/stor3066-3530-4765-b566-333938653037/23866796.jpg","https://static.tildacdn.com/stor3038-6361-4962-b965-346531666432/26094552.jpg"]},
  {title:"Сладкая Прага: гастрономическое путешествие для сладкоежек",duration:"3 часа",description:"Добро пожаловать в путешествие по самой сладкой стороне Праги! Мы отправимся на прогулку по уютным улочкам города, чтобы познакомиться с традиционными чешскими десертами и необычными сладостями.\n\nЧто вас ждёт: сладкое начало в сердце Старого города с чешскими колачами, погружение в шоколадную магию, штрудель и музыка, знаменитый трдельник и секретное кафе с потрясающим видом на Прагу.",images:["https://static.tildacdn.com/stor6534-3763-4032-b739-323138333763/57407264.jpg","https://static.tildacdn.com/stor3266-6337-4834-b230-643138353265/20657914.jpg","https://static.tildacdn.com/stor6538-6135-4637-a337-303232366135/37108205.jpg","https://static.tildacdn.com/stor6430-6263-4536-a464-333637383038/48866113.jpg"]},
  {title:"Экскурсия по Праге на карете",duration:"2 часа",description:"Погрузитесь в атмосферу старины и романтики с экскурсией, которая объединяет поездку на карете по историческим улицам Праги и неспешную прогулку по самым живописным уголкам.\n\nМы начнём путешествие в уютной карете, запряжённой лошадьми. После каретной прогулки мы продолжим исследовать город пешком: Староместская площадь, Карлов мост, Пражская Венеция и кормление лебедей у воды.",images:["https://static.tildacdn.com/stor3565-3633-4130-b366-626636313336/67150468.jpg","https://static.tildacdn.com/stor3939-3066-4938-b231-336631623835/56332530.jpg","https://static.tildacdn.com/stor6131-6437-4164-a465-373932396231/98665600.jpg","https://static.tildacdn.com/stor6436-3732-4833-a562-616337323530/53653216.jpg"]},
  {title:"Пражский еврейский квартал",duration:"2 часа",description:"Приглашаем вас в увлекательное путешествие по Йозефову — старинному еврейскому кварталу, который веками был центром еврейской культуры в Европе.\n\nВы узнаете, как развивался этот район, почему его называют «городом в городе», и что связывает его с легендой о Големе. Мы покажем уникальные памятники: от Староновой синагоги до древнего Еврейского кладбища.",images:["https://static.tildacdn.com/stor6661-3637-4338-a163-386132616633/42597896.jpg","https://static.tildacdn.com/stor6638-3133-4835-b862-656134373333/62983511.jpg","https://static.tildacdn.com/stor6539-3266-4535-a239-666564333164/16282899.jpg","https://static.tildacdn.com/stor3535-6266-4331-b762-313530646539/55607213.jpg"]},
  {title:"Авто-пешая обзорная экскурсия по Праге",duration:"2 часа",description:"Идеальный вариант для тех, кто хочет с комфортом увидеть самые основные достопримечательности Праги!\n\nМы совершим настоящее путешествие во времени, увидев не только современную Прагу, но и ту, которой чешская столица была сто, двести, а то и тысячу лет назад. Большую часть маршрута мы проедем на комфортабельном автотранспорте!\n\nМы посетим Карлов мост, Староместскую площадь с астрономическими часами, Пражский Град с собором Святого Вита.",images:["https://static.tildacdn.com/tild3262-3164-4265-b633-393032343734/120487505_3648939601.jpg","https://static.tildacdn.com/tild3232-3830-4731-a539-643263633763/DSC00617-2.jpg","https://static.tildacdn.com/tild3232-6632-4636-b861-383735316536/67052074_25462874287.jpg","https://static.tildacdn.com/tild6162-3338-4861-a135-306339366561/72956756_27209626945.jpg"]},
  {title:"Онлайн-экскурсия по Праге",duration:"1.5 часа",description:"Приглашаю вас на увлекательную онлайн-экскурсию по Праге, где вы сможете почувствовать атмосферу одного из самых красивых городов Европы, не выходя из дома.\n\nМы прогуляемся по старинным улочкам и площадям, поговорим о соборах, загадочных легендах и скрытых уголках города. Это не просто лекция — это живой диалог!\n\nУдобно, увлекательно и доступно из любой точки мира.",images:["https://static.tildacdn.com/stor3731-3038-4631-b361-353533646430/81189483.jpg","https://static.tildacdn.com/stor3432-3533-4835-b866-623533326565/17733649.jpg","https://static.tildacdn.com/stor6338-3934-4061-a232-313637303234/50857229.jpg","https://static.tildacdn.com/stor3631-6231-4032-b332-333164346463/43638485.jpg"]},
  {title:"Чешский Крумлов и замок Глубока над Влтавой",duration:"10 часов",description:"Небольшой древний городок Чешский Крумлов удивит вас своим уютом и средневековым шармом, а замок Глубока над Влтавой очарует белоснежным силуэтом.\n\nГлубока над Влтавой — настоящая белоснежная жемчужина Южной Чехии. Высокие зубцы башен, украшения, балконы и бастионы — всё пропитано сказкой. В замке вас ждёт часовая экскурсия по внутренним покоям.\n\nЧешский Крумлов — один из красивейших городков Европы, включён в список ЮНЕСКО.",images:["https://static.tildacdn.com/tild6337-3738-4434-a435-626630306163/photo_2022-04-10_130.jpeg","https://static.tildacdn.com/tild3861-6566-4839-b262-306232643766/photo_2022-04-10_125.jpeg","https://static.tildacdn.com/tild3666-6239-4633-b230-383865333038/photo_2022-04-10_125.jpeg","https://static.tildacdn.com/tild3430-3563-4266-b639-663339656439/photo_2022-04-10_125.jpeg"]},
  {title:"Замок Чешский Штернберг и пивзавод Велкопоповицкий Козел",duration:"8 часов",description:"Замок Чешский Штернберг возвышается на высокой горе в глухом лесу. Готический град был основан в 1241 году. Изюминка замка — он жилой! С момента основания и по сей день замком владеет род Штернбергов.\n\nПосле замка мы отправимся на пивзавод Велкопоповицкий Козел, где вы узнаете секреты пивоварения и продегустируете свежее пиво, производимое по традиционным рецептам XVI века.",images:["https://static.tildacdn.com/stor6464-3136-4733-b034-386335323464/23268284.jpg","https://static.tildacdn.com/tild3139-6531-4339-b865-303531626238/1d0bc4e0-dfb2-4b10-b.jpeg","https://static.tildacdn.com/tild3162-6164-4037-a239-363864633065/5dfa098e-f24f-4b81-b.jpeg","https://static.tildacdn.com/tild3462-3164-4630-a566-663431393562/hrad-cesky-sternberk.jpeg"]},
  {title:"Карловы Вары и пивзавод Крушовице",duration:"10 часов",description:"Посетите самый знаменитый курорт Центральной и Восточной Европы — Карловы Вары и узнайте секреты пивоварения на королевском пивзаводе Крушовице!\n\nПиво Крушовице не подвергается пастеризации, сохраняя уникальный вкус. Во время экскурсии вы продегустируете свежесваренное пиво.\n\nКарловы Вары славятся феерической архитектурой и 12 целебными источниками, бьющими из-под земли с глубины 2000 метров.",images:["https://static.tildacdn.com/tild3838-3531-4665-a133-303933656565/republique-tcheque-k.jpeg","https://static.tildacdn.com/tild6334-6461-4332-b535-353465663663/Karlovy-Vary.jpeg","https://static.tildacdn.com/tild3930-6262-4736-a637-313033616163/19-1-karlovy-vary-i-.jpeg","https://static.tildacdn.com/tild6262-3637-4138-a264-313161623239/photo_2022-02-21_134.jpeg"]},
  {title:"Вся Прага за 2 часа на авто",duration:"2 часа",description:"Самый комфортабельный и лёгкий вариант обзорной экскурсии — на автомобиле! Экскурсия-поездка по центру Златой Праги через все основные достопримечательности.\n\nВы увидите Карлов мост, Староместскую площадь с астрономическими часами, Пражский Град с собором Святого Вита, холм Петршин, набережную Влтавы, Танцующий дом и многое другое.\n\nПри необходимости мы будем делать остановки для фотографий.",images:["https://static.tildacdn.com/tild6466-3365-4731-b263-666364326566/photo_2022-02-21_130.jpeg","https://static.tildacdn.com/tild3563-3832-4861-a565-626630666331/photo_2022-02-21_130.jpeg","https://static.tildacdn.com/tild3939-6563-4561-b037-613735653535/59295381_23978187369.jpeg","https://static.tildacdn.com/tild3739-6565-4034-b361-643966363264/72956756_27209626945.jpg"]},
  {title:"Два в одном: Вся Прага и замок Мельник за один день!",duration:"8 часов",description:"Уникальное путешествие, в котором за один день вы насладитесь главными достопримечательностями Праги и очарованием замка Мельник.\n\nПосле знакомства с Прагой мы отправимся в замок Мельник — «дамский замок», известный старинными винными традициями. Вы спуститесь в средневековые погреба, попробуете знаменитые вина и полюбуетесь видами на слияние Влтавы и Лабы.",images:["https://static.tildacdn.com/tild6431-6264-4435-a162-316435306665/photo_2022-02-21_130.jpeg","https://static.tildacdn.com/tild3632-3261-4563-a535-363633666539/70846137_26612616338.jpg","https://static.tildacdn.com/tild3137-3533-4164-b434-666636656565/120539281_3648957945.jpg","https://static.tildacdn.com/tild3961-3766-4339-a439-356435653036/67052074_25462874287.jpg"]},
  {title:"Кутна Гора, Костнице и замок Чешский Штернберг",duration:"8 часов",description:"Замок Чешский Штернберг, один из старейших замков в Чехии, основан в 1241 году. Изюминка — замок жилой, с момента основания им владеет род Штернбергов.\n\nПосле замка мы отправимся в Кутна Гору — средневековую серебряную столицу Европы. Посетим готический собор Св. Варвары и знаменитую Костницу — Седлецкий оссуарий, украшенный человеческими костями.",images:["https://static.tildacdn.com/tild3634-6133-4366-a666-323265313331/Cesky_sternberk_inte.jpeg","https://static.tildacdn.com/tild3763-3437-4762-a165-396136626539/fb790daf-0480-406a-9.jpeg","https://static.tildacdn.com/tild6261-3935-4330-b666-646566393636/6e36769addb0dcf4af30.jpeg","https://static.tildacdn.com/tild6130-3861-4661-a162-373366323562/-e1533796965355.jpeg"]},
  {title:"Водный замок Блатна",duration:"6 часов",description:"Посетите средневековый замок Блатна на юге Чехии — уютное место с прекрасным парком, прудом и дружелюбными оленями!\n\nОснованный в XII веке среди болот, замок окружён прекрасным английским парком площадью 42 гектара, с аллеями, прудом с карпами и лодочками. Особое очарование придают ручные олени, свободно гуляющие по территории.",images:["https://static.tildacdn.com/stor3533-3466-4564-b262-643032616663/49677673.jpg","https://static.tildacdn.com/stor3734-3862-4765-b432-643430616533/60219995.jpg","https://static.tildacdn.com/stor3534-3962-4362-b461-636235303962/57116759.jpg","https://static.tildacdn.com/stor3436-6539-4033-b031-383461303138/20867931.jpg"]},
  {title:"Карловы Вары и замок-крепость Локет",duration:"11 часов",description:"Увлекательное путешествие из Праги в Карловы Вары с посещением средневекового замка Локет — величественной крепости XIII века на гранитной скале.\n\nВо время экскурсии по замку вы узнаете о его богатой истории, посетите часовню-ротонду XII века. После Локета мы направимся в Карловы Вары — знаменитый курортный город с термальными источниками и элегантной архитектурой.",images:["https://static.tildacdn.com/stor3932-6163-4464-b566-323563373035/67015813.jpg","https://static.tildacdn.com/stor6638-3865-4737-b066-386366663865/81585256.jpg","https://static.tildacdn.com/stor3864-3234-4431-b661-303666613937/37853627.jpg","https://static.tildacdn.com/stor3430-3138-4561-b135-393632366136/84753557.jpg"]},
  {title:"Прага глазами местного жителя",duration:"2 часа",description:"Легкая, интересная, познавательная экскурсия-прогулка по Праге, которая познакомит вас с основными достопримечательностями и позволит заглянуть в менее туристические, но не менее красивые уголки чешской столицы.\n\nВы отведаете вкуснейшее чешское пиво в местах, излюбленных местными жителями, посмотрите на Прагу с высоты птичьего полёта и запечатлеете город с самых красивых смотровых площадок.",images:["https://static.tildacdn.com/tild3439-6630-4464-b131-346564636664/----.jpeg","https://static.tildacdn.com/tild6637-6263-4438-b538-316237616666/photo_2022-02-21_130.jpeg","https://static.tildacdn.com/tild3030-6165-4333-b634-373464616639/_dsc3414.jpeg","https://static.tildacdn.com/tild6161-6364-4232-b932-306433656630/2016_236212010.jpeg"]},
  {title:"Прага для влюблённых",duration:"2 часа",description:"Прага — один из самых романтичных городов мира! Мы пройдём по знаменитому Карлову мосту — самому романтичному мосту Чехии. Загадаем заветные желания!\n\nПод Карловым мостом нас ждёт «пражская Венеция». Мы сделаем фотографии, пройдём по самой узенькой улочке и покормим пражских лебедей. Заедем на красивейшую смотровую с живописным видом на Прагу.",images:["https://static.tildacdn.com/tild3931-3864-4034-a532-613065393836/120487505_3648939601.jpeg","https://static.tildacdn.com/tild3535-3835-4330-b437-386665393061/VRST-090-romantika-p.jpeg","https://static.tildacdn.com/tild3330-3030-4461-b262-666164353361/sandemans-new-prague.jpg","https://static.tildacdn.com/tild6535-6533-4935-b838-316461346432/214697454_4451043914.jpeg"]},
  {title:"Карловы Вары и Марианские Лазне",duration:"10 часов",description:"Приглашаем на экскурсию в Карловы Вары — крупнейший курорт Чехии. Вас ожидает знакомство с историей и достопримечательностями, а также свободное время для прогулок.\n\nПоездку предлагаем совместить с посещением Марианских Лазне — второго по величине бальнеологического курорта Чехии, чрезвычайно богатого природными целебными источниками.",images:["https://static.tildacdn.com/tild3334-3866-4264-b734-383865383138/region_f26d66b2d9.jpeg","https://static.tildacdn.com/tild6262-3637-4138-a264-313161623239/photo_2022-02-21_134.jpeg","https://static.tildacdn.com/tild6466-3966-4437-b639-666234613437/karlovy-vary-sale-co.jpeg","https://static.tildacdn.com/tild3930-6262-4736-a637-313033616163/19-1-karlovy-vary-i-.jpeg"]},
  {title:"Прага для девушек",duration:"2 часа",description:"Специально для вас, девушки, мы разработали эту экскурсию, включив все классические пожелания: живописные смотровые площадки с яркими фотографиями, прогулки по узеньким улочкам, загадывание желаний на Карловом мосту.\n\nМы заглянем в уютный ресторанчик с традиционной чешской кухней и вкуснейшим пивом, попробуем свежеиспечённый трдельник с клубникой и сливками!",images:["https://static.tildacdn.com/tild3933-3336-4036-a266-646337336437/41880531_20502907416.jpg","https://static.tildacdn.com/tild3232-6632-4636-b861-383735316536/67052074_25462874287.jpg","https://static.tildacdn.com/tild6162-3338-4861-a135-306339366561/72956756_27209626945.jpg","https://static.tildacdn.com/tild6430-3231-4464-b363-633330653865/67317484_25355524664.jpg"]},
  {title:"Прага — лучший город для инвестиций!",duration:"2 часа",description:"Интересный и познавательный экскурсионно-информационный тур по чешской столице. Мы поделимся ценным опытом и знаниями о жизни в Праге, покупке недвижимости, наиболее подходящих для этого районах.\n\nПокупка недвижимости в Праге — верный способ сохранить и приумножить финансы. Гарантируем правдивую и достоверную информацию, покажем перспективные районы, познакомим с застройщиками и юристами.",images:["https://static.tildacdn.com/tild6139-6162-4134-a139-613163363636/slide1.jpeg","https://static.tildacdn.com/tild3961-3930-4664-b437-636236656230/778_1200x755.jpeg","https://static.tildacdn.com/tild3562-6432-4539-b630-616335353235/461803-resize_kvarti.jpeg","https://static.tildacdn.com/tild6464-3164-4230-b730-356663656261/437285-resize_kvarti.jpeg"]},
  {title:"Крепость Вышеград",duration:"2 часа",description:"Вышеград — древняя крепость на скале над Влтавой, откуда, по легенде, княгиня Либуше предсказала великое будущее Праги.\n\nМы посетим готический собор Св. Петра и Павла, кладбище «Славин» с могилами Дворжака и Сметаны, погуляем по чудесному парку к самому романтичному месту у крепостной стены, откуда открывается захватывающий вид на Прагу с высоты птичьего полёта.",images:["https://static.tildacdn.com/tild3630-6264-4638-a332-626435643661/Vysehrad-cemetery.jpeg","https://static.tildacdn.com/tild3939-6561-4039-a335-363233336439/Vyishegrad5.jpeg","https://static.tildacdn.com/tild3232-6239-4665-a533-373664393134/vyshegrad_45.jpeg","https://static.tildacdn.com/tild6232-3132-4735-b063-376533386536/144.jpeg"]},
  {title:"По пражским паркам и смотровым",duration:"2 часа",description:"Приглашаем на легкий и живописный маршрут по самым красивым паркам и смотровым площадкам Праги! Более половины площади города — зелёные зоны!\n\nЭта экскурсия нестандартная и составляется с учётом ваших пожеланий. Идеально для любителей фотографировать живописные виды, ценителей отдыха на природе и тех, кто хочет полюбоваться знаменитыми пражскими красными крышами.",images:["https://static.tildacdn.com/stor3838-6463-4432-a463-663663386234/33045413.jpg","https://static.tildacdn.com/stor6435-3435-4734-b739-666561333565/57813080.jpg","https://static.tildacdn.com/tild6138-3061-4531-b839-653438303631/1083_18b91d1cb4ea09b.jpeg","https://static.tildacdn.com/tild6439-3866-4861-b065-303135383136/5d398b3c0a5ba31d181f.jpeg"]},
  {title:"Пивной тур по лучшим пражским пивным!",duration:"2 часа",description:"Вы — настоящий ценитель пива? Или просто хотите узнать больше о традиционном чешском напитке? Тогда добро пожаловать!\n\nВ экскурсию входит посещение нескольких лучших пражских пивных и пивоварен, где вы познакомитесь с различными сортами чешского пива, узнаете секреты приготовления «жидкого хлеба» и попробуете традиционные чешские закуски.",images:["https://static.tildacdn.com/tild6531-6261-4239-b830-666462663965/215005068_4451088874.jpg","https://static.tildacdn.com/tild3536-3338-4138-a364-626137666331/beer-1290633_1920.jpg","https://static.tildacdn.com/tild3866-3933-4136-b963-333762613238/photo_2022-02-21_130.jpeg","https://static.tildacdn.com/tild3761-6166-4263-b733-653665623834/53850193_23185562748.jpg"]},
  {title:"Замки Конопиште и Карлштейн",duration:"9 часов",description:"Приглашаем отправиться в гости к Францу-Фердинанду! Замок Конопиште стал последней резиденцией эрцгерцога. В замке сохранилась коллекция оружия, насчитывающая более 4500 предметов, и коллекция охотничьих трофеев.\n\nКарлштейн — величественный символ Чешской Республики, воплощение мечты императора Карла IV. Когда-то здесь хранилась корона Священной Римской империи.",images:["https://static.tildacdn.com/tild3263-3833-4039-a366-633833356564/1601144301169716002.jpeg","https://static.tildacdn.com/tild3034-3037-4565-b130-313134636439/03634995.jpeg","https://static.tildacdn.com/tild3938-6365-4132-b239-333263633139/dreamstime_xxl_90828.jpeg","https://static.tildacdn.com/tild3534-6433-4336-b161-343739396165/strelnice-ken4.jpeg"]},
  {title:"Пивной-гастро тур по лучшим пивоварням Праги и Чехии",duration:"8 часов",description:"Лучшее пиво, традиционная чешская кухня, аутентичная Чехия и нетуристическая Прага!\n\nМы посетим одну из старейших чешских монастырских пивоварен. Далее удивим вас семейной мини-пивоварней с аутентичной кухней и вкуснейшим крафтовым пивом!\n\nПо желанию можно включить посещение завода Plzeňský Prazdroj.",images:["https://static.tildacdn.com/tild6136-3030-4665-a462-663064663430/bars_beer-cheers-fri.jpeg","https://static.tildacdn.com/tild6232-3532-4536-b565-666261633862/pilsen-urquell01.jpeg","https://static.tildacdn.com/tild3739-6430-4265-b463-333366653730/Prohlidka-pivovaru-P.jpeg","https://static.tildacdn.com/tild3263-6363-4536-a433-316536646262/Prohlidka-pivovaru-P.jpeg"]},
  {title:"Из Праги в Дрезден",duration:"8 часов",description:"Всего в 1,5 часах езды от чешской столицы находится немецкий Дрезден — некогда столица королевства Саксонии, один из самых могущественных и богатых городов Европы.\n\nВы увидите все основные достопримечательности. Дрезден — город искусства: в Картинной галерее Старых Мастеров хранится «Сикстинская Мадонна» Рафаэля и «Шоколадница» Лиотара.",images:["https://static.tildacdn.com/tild3031-3930-4866-b962-623833383264/photo_2022-04-10_133.jpeg","https://static.tildacdn.com/tild6364-3136-4537-b463-363338623134/kennel-956212_1920.jpg","https://static.tildacdn.com/tild3865-3166-4431-b132-333738376130/photo_2022-04-10_133.jpeg","https://static.tildacdn.com/tild3664-3739-4063-b664-393465363034/photo_2022-04-10_133.jpeg"]},
  {title:"Замки Кршивоклат и Карлштейн",duration:"9 часов",description:"Неповторимые впечатления от экскурсии в средневековье! Карлштейн — величественный символ Чехии, задуманный как нерушимый символ Римской империи. В капелле Св. Креста хранилась корона Священной Римской империи.\n\nГотический замок Кршивоклат — бывший охотничий замок чешских королей, окружённый живописными лесами.",images:["https://static.tildacdn.com/tild3434-6264-4261-a262-643231393832/2016116170435.jpeg","https://static.tildacdn.com/tild3034-3037-4565-b130-313134636439/03634995.jpeg","https://static.tildacdn.com/tild3938-6365-4132-b239-333263633139/dreamstime_xxl_90828.jpeg","https://static.tildacdn.com/tild3263-3833-4039-a366-633833356564/1601144301169716002.jpeg"]},
  {title:"Круиз по реке с ужином и живой музыкой",duration:"3 часа",description:"Трёхчасовой круиз с ужином и музыкой — незабываемое впечатление! Вы увидите пражские достопримечательности с воды: Пражский Град, Карлов мост, Национальный театр, Танцующий дом, Вышеград.\n\nПриятную атмосферу дополнят живая музыка и ужин в форме шведского стола. В цену включён аперитив.",images:["https://static.tildacdn.com/tild6338-6665-4666-b166-306165643964/vanocni-vecirek-na-l.jpeg","https://static.tildacdn.com/tild3535-6136-4532-a438-613637613136/9146540-2ec314.jpeg","https://static.tildacdn.com/tild3664-6638-4365-a366-333662626632/2014-05-08-253-341-1.jpeg","https://static.tildacdn.com/tild3866-6537-4332-b462-393764376461/34737c69-a59b-41b0-8.jpeg"]},
  {title:"VIP-экскурсия по Праге на Mercedes-Benz S-class Long",duration:"2 часа",description:"Специально для самых взыскательных клиентов — экскурсия-знакомство с Прагой на Mercedes-Benz S-class Long с панорамной крышей в сопровождении профессионального гида и водителя.\n\nВысокий уровень комфорта, исключительная безопасность, индивидуальный подход. Вы увидите Прагу с самых живописных смотровых площадок города.\n\nДля групп от 3 человек — комфортабельный Mercedes Vito в премиум комплектации.",images:["https://static.tildacdn.com/tild3765-6265-4937-b261-643634663164/img-20190513-wa0019.jpeg","https://static.tildacdn.com/tild3331-3832-4135-a362-373331333432/img-20190513-wa0000.jpeg","https://static.tildacdn.com/tild6239-3432-4535-b334-333162666661/img-20190513-wa0006.jpeg","https://static.tildacdn.com/tild6635-6239-4263-b338-353665653465/img-20190513-wa0007.jpeg"]},
]

async function downloadImage(url: string): Promise<{ buffer: Buffer; name: string; mimetype: string } | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    if (buffer.length < 1000) return null

    const urlPath = new URL(url).pathname
    const name = urlPath.split('/').pop() || 'image.jpg'
    const ext = name.split('.').pop()?.toLowerCase()
    const mimetype = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'

    return { buffer, name, mimetype }
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const results: string[] = []

  try {
    // Step 1: Delete RU-only tours (publishedLocales contains only 'ru')
    const allTours = await payload.find({ collection: 'tours', limit: 100, locale: 'en' })
    let deleted = 0
    for (const tour of allTours.docs) {
      const locales = tour.publishedLocales as string[] | undefined
      if (locales && locales.length === 1 && locales[0] === 'ru') {
        await payload.delete({ collection: 'tours', id: tour.id })
        deleted++
      }
    }
    results.push(`Deleted ${deleted} RU-only tours`)

    // Step 2: Create new tours from ulitravel.com data
    for (let i = 0; i < TOURS.length; i++) {
      const tour = TOURS[i]
      const slug = slugify(tour.title)
      const dur = parseDuration(tour.duration)
      const category = getCategory(tour.title, dur)

      // Check if tour with this slug already exists
      const existing = await payload.find({ collection: 'tours', where: { slug: { equals: slug } }, limit: 1, locale: 'ru' })
      if (existing.totalDocs > 0) {
        results.push(`Skipped (exists): ${tour.title}`)
        continue
      }

      // Download hero image (first image)
      let heroImageId: number | undefined
      if (tour.images.length > 0) {
        const img = await downloadImage(tour.images[0])
        if (img) {
          try {
            const media = await payload.create({
              collection: 'media',
              data: { alt: tour.title },
              file: { data: img.buffer, mimetype: img.mimetype, name: img.name, size: img.buffer.length },
              locale: 'ru',
            })
            heroImageId = media.id as number
          } catch (e) {
            results.push(`Failed to upload hero for ${tour.title}: ${e instanceof Error ? e.message : 'unknown'}`)
          }
        }
      }

      // Download gallery images (remaining)
      const galleryItems: { image: number }[] = []
      for (let j = 1; j < tour.images.length && j <= 3; j++) {
        const img = await downloadImage(tour.images[j])
        if (img) {
          try {
            const media = await payload.create({
              collection: 'media',
              data: { alt: tour.title },
              file: { data: img.buffer, mimetype: img.mimetype, name: img.name, size: img.buffer.length },
              locale: 'ru',
            })
            galleryItems.push({ image: media.id as number })
          } catch {
            // skip failed gallery image
          }
        }
      }

      // Create tour
      const data: Record<string, unknown> = {
        title: tour.title,
        slug,
        excerpt: richText(tour.description.split('\n\n')[0] || tour.description.substring(0, 200)),
        description: richText(tour.description),
        category,
        duration: dur,
        pricing: { model: 'ON_REQUEST' },
        publishedLocales: ['ru'],
        status: 'published',
        sortOrder: i + 10,
        tags: [],
        difficulty: 'easy',
        _status: 'published',
      }

      if (heroImageId) data.heroImage = heroImageId
      if (galleryItems.length > 0) data.gallery = galleryItems

      const created = await payload.create({ collection: 'tours', locale: 'ru', data })

      // EN fallback for admin list
      await payload.update({
        collection: 'tours',
        id: created.id,
        locale: 'en',
        data: {
          title: tour.title,
          slug,
          excerpt: richText(tour.description.split('\n\n')[0] || tour.description.substring(0, 200)),
          description: richText(tour.description),
        },
      })

      results.push(`Created tour #${i + 1}: ${tour.title} (ID: ${created.id}, hero: ${heroImageId ? 'yes' : 'no'}, gallery: ${galleryItems.length})`)
    }

    return NextResponse.json({ success: true, results })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'unknown', results }, { status: 500 })
  }
}
