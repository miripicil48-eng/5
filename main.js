// ------------------- ESCENA INICIO -------------------
class Inicio extends Phaser.Scene {

    constructor(){
        super("Inicio");
    }

    preload(){
        this.load.image("fondoInicio","fondo.jpg");
        this.load.image("boton","boton.jpg");
    }

    create(){
        let fondo=this.add.image(450,300,"fondoInicio");
        fondo.setDisplaySize(900,600);

        let boton=this.add.image(450,450,"boton")
            .setScale(0.5)
            .setInteractive();

        this.add.text(400,440,"COMENZAR",{
            fontSize:"28px",
            color:"#000000"
        });

        boton.on("pointerdown",()=>{
            this.scene.start("Juego");
        });
    }
}


// ------------------- ESCENA JUEGO -------------------
class Juego extends Phaser.Scene {

    constructor(){
        super("Juego");
    }

    preload(){
        this.load.image("raspado","Rasca.jpg");
        this.load.image("brush","brush.png");
        this.load.image("fondoJuego","fondoj.jpg");

        this.load.image("pizza","premio1.jpg");
        this.load.image("estrella","premio2.jpg");
        this.load.image("meme","premio3.jpg");
        this.load.image("nada","nada.jpg");
    }

    create(){
        let fondo=this.add.image(450,300,"fondoJuego");
        fondo.setDisplaySize(900,600); 

        let g = this.make.graphics({x:0,y:0,add:false});
        g.fillStyle(0xffffff,1);
        g.fillCircle(32,32,32);
        g.generateTexture("brush",64,64);
        g.destroy();

        this.premios=["pizza","estrella","meme","nada"];
        this.resultados=[];
        this.tarjetas=[];
        this.descubiertas=0;

        // contador circular
        this.grafica = this.add.graphics();
        this.textoPorcentaje = this.add.text(430,70,"0%",{
            fontSize:"28px",
            color:"#000000"
        });

        let posiciones = [200,450,700];

        if(Math.random() < 0.3){  
            // 30% de probabilidad de ganar
            let premio = Phaser.Utils.Array.GetRandom(this.premios);
            this.resultados = [premio, premio, premio];
        }else{  
            // pierde
            this.resultados = [
                Phaser.Utils.Array.GetRandom(this.premios),
                Phaser.Utils.Array.GetRandom(this.premios),
                Phaser.Utils.Array.GetRandom(this.premios)
            ];
        }

        for(let i=0; i<3; i++){
            let premio = this.resultados[i];
            this.add.image(posiciones[i],350,premio).setScale(0.5);

            let rt = this.add.renderTexture(
                posiciones[i],
                350,
                200,
                200
            );

            rt.draw("raspado",0,0);  

            let tarjeta=this.add.image(posiciones[i],350);

            this.tarjetas.push({
                rt:rt,
                img:tarjeta,
                porcentaje:0,
                descubierta:false
            });
        }

        // raspar
        this.input.on("pointermove",(pointer)=>{
            if(pointer.isDown){
                this.tarjetas.forEach(t=>{
                    if(t.descubierta) return;

                    let localX=pointer.x-(t.img.x-100);
                    let localY=pointer.y-(t.img.y-100);

                    if(localX>0 && localX<200 && localY>0 && localY<200){
                        t.rt.erase("brush",localX,localY,1);

                        t.porcentaje = Math.min(t.porcentaje + 0.3, 100);

                        this.actualizarCirculo(t.porcentaje);

                        if(t.porcentaje>90){
                            t.descubierta=true;
                            t.rt.erase("brush",100,100,10);
                            t.rt.clear();

                            this.descubiertas++;

                            if(this.descubiertas===3){
                                this.verificarPremio();
                            }
                        }
                    }
                });
            }
        });
    }

    // contador circular
    actualizarCirculo(p){
        this.grafica.clear();
        this.grafica.lineStyle(10,0x00ff00);
        this.grafica.beginPath();
        this.grafica.arc(
            450,
            80,
            40,
            Phaser.Math.DegToRad(270),
            Phaser.Math.DegToRad(270 + p*3.6),
            false
        );
        this.grafica.strokePath();
        this.textoPorcentaje.setText(Math.floor(p)+"%");
    }

    // verificar premios
    verificarPremio(){
        let mensaje="";
        if(
            this.resultados[0]===this.resultados[1] &&
            this.resultados[1]===this.resultados[2]
        ){
            mensaje="🎉 GANASTE 🎉";
        }else{
            mensaje="😢 Intenta otra vez";
        }

        this.add.text(360,200,mensaje,{
            fontSize:"40px",
            color:"#ffff00"
        });
        this.botonReiniciar();
    }

    // boton reiniciar
    botonReiniciar(){
        let boton=this.add.text(380,520,"JUGAR OTRA VEZ",{
            fontSize:"32px",
            backgroundColor:"#00aa00",
            padding:10
        })
        .setInteractive();

        boton.on("pointerdown",()=>{
            this.scene.restart();
        });
    }
}


// ------------------- CONFIGURACION -------------------
const config={
    type:Phaser.AUTO,
    width:900,
    height:600,
    scale:{
        mode:Phaser.Scale.FIT,
        autoCenter:Phaser.Scale.CENTER_BOTH
    },
    parent:"game",
    scene:[Inicio,Juego]
};

const game = new Phaser.Game(config);