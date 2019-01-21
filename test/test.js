'use strict'

const async = require('asyncawait/async')
const Operator = require('../server/Operator')
const bigInt = require("big-integer")

const operator = '0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE'

// A = acc.getAccumulators()

// just for testing
let proof_init1 = [[3,{"z":"21168615609548963274120773781125946682012924743949643382984609636343780752590852431623545243690559728087464167257451146142014511943475871736448123249722526934984475917391577120492668201664401366525647576294036469362881559767267701611480215479660774128160904844722787611295835231112750261101051071045210061242152733299793980775255736477601140492662069823350772945309114544265072340356805999830133792688493138409639368847997116923156515164618235411593625929738995723868293013192260383273069063508808354833353653224646350898220907028233534489955864114405968333900340387229482333250078037077203432447845856434495735253977","Q":"18602306971653750378993013602774775581519230247417920727404942815228020731410127135598440244213443369539308748995643110532939931912222489724588397025472257067836023312902844756849512629632184983785389490691650430913721723637254539967524622047463251467931958675858934227118829987399027852749930104964296962314749519529019379489229878193145221549948807161492561728923094289857158613477414221922303013118525180993180713312794736729202550467024687448110260466100718399167330156640870843786731619862924221587016312146457082942677919830358834931910812876908047316533989720199993422347596379100692770711591216063616141033378","r":"890119234231"}],[3,{"z":"21124061955735513758522613782734450215460238456121743493470419985971356071885930069824796088797777543784499964006357800982514002726935713043287406316739474437315598047832248873603649104473538521937937248482325458674828953049967442578818796143842210088201753550334718323320852138008818738685357228797787464309567667909420981617358727231915162322692205604254990228905100619862744310189176403461870546369586708301360896403214977122595392190311692783896417721493904941044534191622019979692726846059181591027535560817554185104149445354832433091900144215350785543353100905096542835733665609890706371965266319072367103327094","Q":"9643426135116943066897783156959404142491728153144504090898428366009502770715260101637270964572525708777864078102081648538342803064204908806224455917562665985860723335875563292872324685127598837503849009324542257853484335024718176519180023575867207947674445232363821763992614878955066032642005825311846874235057258593809536333263677350421928769682590190388137946707029683322438867569204402694451021645727652796621198593764505168171290256960668292239770575841752450121032366554349781776274450114785967038181371718513415004744609141828467635685224202895810281891492109424185759320404728818042305635240880405892692636489","r":"165318556017"}]]
let proof_init2 = [[2,{"z":"1031967240536496565316138923474380341116880055666436080545125766784491200959405595230149590382413217451738865361819967786010819543266816278642459695397872467726178409050427473940901377882632286769516961060694470597744085454990195008601991098260754736985161246748619466328661177026080990113257005901201749036496755261407364011618775929819778751046003267784322475296621999927387967520163000801599833157703240724793626274997251828304602470793846544947289359665243665836644083541057380125916882345364907568689504841372036600492797322479257624505258963466024202408635726859223383107200030042191539874169238683461757957423","Q":"4478765542706394698818461096706926059013661675045519901217803482897823670831255001536553139503684760007105466293836521019384140952125346803455773045781992725800559082131319979342249734698160247405722793966033151195273002876029612604543284352287100516135623802303324011827853635123074404509739266361387061814983639087166982414172930673187340624668296415163939243176333000325455653417236891550844238553199319744402524688538415161515332939728244714631522741781353106297059190226909292633825663500688811956275986400605848996835410443238441454535720521742194162513731449746021150084573972531359770464093620284249331789789","r":"72997113349"}],[2,{"z":"352362020158963290226545540462319989278425421899523491214862131665818526879720410615242047808795924758102987917295081271593251622371531957959704180690580403335732561680757952893508417664613668176561043068964740722968442373899459074063762880418727706989888685238087855122347980966861403669483265468596243853986886221575069116567614411008101666895804671802851138538190796185203742718822872914603328039048880661686685160646269265845265188132943988361385079300682810580791789292723563327493547758063852953536161722607598802947424123932637980477477139432405057261042990355664096329352657755699119901681101037468506614107","Q":"3916184402794393095913106844587347998822769607694470466087428600631234160840456648795917582017548531299015592323348895031843478134557904939480207743720100900151364602044283999445136621083983418778129907583380689411799988736732227457028033062014756620943904100490978750050730495098146924935027158219676739761580245979276369158374930557504416182853146853875459918202567024785962028329052510779177815854372127811850574445014647824925885891492077295897706888478987115714044018324124160105215839343425479481232805683975977965602889371409631709188070003096381088429052701186247793988220430251060122888458812535953231223068","r":"115301347788"}]]
// //acc.addBlock(b2)
// //acc.addBlock(b3)
// //console.log(acc.ids)

// // acc.altInclusionWitnesses().forEach((e)=>{
// //   console.log(e.toString())
// // })

// let pi = acc.generateInclusionProofs()
// console.log('Proof of exponentiation: ' + JSON.stringify(pi[1]))
// pi = acc.getSingleInclusionProof(353)
// console.log('Single element proof: ' + JSON.stringify(pi))

// //acc.altInclusionWitnesses()

// console.log(acc.verifyPoKE(pi))

// let v = bigInt(1)

// primes[0].forEach((e)=>{
//   //console.log(e)
//   if(e!==undefined) v = v.multiply(e)
// })

// primes[1].forEach((e)=>{
//   //console.log(e)
//   if(e!==undefined) v = v.multiply(e)
// })

// // v will be needed when a challenge to an exiting id is made
// // show that some other prime not in the index range divides v
// // show that v does not belong to the PoK proof provided
// // todo: create function to get v
// console.log(v.toString())


async function main() {
  let acc = new Operator()

  let initPrimes = await acc.init()
  initPrimes.forEach((e)=>{
    //console.log(e)
  })

  //console.log(await acc.db)

  // let tx0 = {index: 3, inputs:[null,0], from:operator, to:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', amt:0.0001, sig:'0x1337', proof: proof_init1 }
  // let tx1 = {index: 2, inputs:[null,0], from:operator, to:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', amt:0.0001, sig:'0x1337', proof: proof_init2 }

  // let b0 = [tx0, tx1]

  // let b2 = [7, 5, 16369, 104849, 1300931, '32416187899', '32416188517', '32416188647', '32416189391', '32416189459', '32416189469']
  // let b3 = ['2997635304785533129', '2129620256793959569', '2432064126451395277', '514175537678074399', '514175537678074399', '514175537678074399', '514175537678074399']

  // let primes =  acc.addBlock(b0)
  // let ins = [0,0]
  // let proof1 = acc.getSingleInclusionProof(3, ins)
  // let proof2 = acc.getSingleInclusionProof(2, ins)
  // //console.log(JSON.stringify(proof1))

  // let tx2 = {index: 1, inputs:[0,0], from:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', to:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', amt:0.0001, sig:'0x1337', proof: proof1 }
  // let tx3 = {index: 4, inputs:[0,1], from:'0x95eF2833688EE675Dfc1350394619ae22b7667dF', to:'0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE', amt:0.0001, sig:'0x1337', proof: proof2 }

  // let b1 = [tx2, tx3]
  // acc.addBlock(b1)
}

main()