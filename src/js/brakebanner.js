class BrakeBanner {
	constructor(selector) {
		// 创建一个应用
		this.app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xffffff,
			resizeTo: window
		});
		this.stage = this.app.stage;

		// 细分为多个容器方便控制
		this.actionButton = new PIXI.Container();
		this.bikeContainer = new PIXI.Container();
		this.bikeLeverImage = null;  // 需要单独的刹车图片素材，为刹车动效做准备
		this.particlesContainer = new PIXI.Container();

		// 将视图添加到DOM中，会创建一个canvas元素
		document.querySelector(selector).appendChild(this.app.view);
	
		// 创建一个加载器用来加载全部资源并保存在resources中
		this.loader = new PIXI.Loader();
		this.loadResources();
	}

	loadResources() {
		this.loader.add("btn.png", "images/btn.png");
		this.loader.add("btn_circle.png", "images/btn_circle.png");
		this.loader.add("brake_bike.png", "images/brake_bike.png");
		this.loader.add("brake_handlerbar.png", "images/brake_handlerbar.png");
		this.loader.add("brake_lever.png", "images/brake_lever.png");
		this.loader.load();

		// 加载完成后开始显示
		this.loader.onComplete.add(() => {
			this.show();
		})
	}

	show() {
		// 创建粒子容器
		this.createParticles();
		this.stage.addChild(this.particlesContainer);

    // 创建自行车容器
		this.createBike();
		this.stage.addChild(this.bikeContainer);
		
		// 创建按钮容器
		this.createActionButton();
		this.stage.addChild(this.actionButton);
		
		// 添加按钮与刹车，粒子之间的交互
		this.actionButtonEvents();

    
		let resize = () => {
			// 使自行车根据窗口大小而调节，一直处于窗口右下角
			this.bikeContainer.x = window.innerWidth - this.bikeContainer.width;
			this.bikeContainer.y = window.innerHeight - this.bikeContainer.height;

			// 移动整个容器的位置到网页视野中
			this.actionButton.x = this.bikeContainer.x + 170;
			this.actionButton.y = this.bikeContainer.y + 230;
		}
		window.addEventListener('resize', resize);
		resize();
	}


	actionButtonEvents() {
		let actionButton = this.actionButton;

		actionButton.interactive = true; // 具备与用户交互的能力
		actionButton.buttonMode = true;  // 鼠标移动到按钮会出现小手的图标

		// 添加按钮事件，点击刹车，松开不刹
		actionButton.on("mousedown", () => {
      gsap.to(actionButton, { duration: 0.3, alpha: 0});

			// bikeLeverImage.rotation = Math.PI / 180 * -30; // 按刹车效果
			// 用gasp效果后，刹车更逼真
			gsap.to(this.bikeLeverImage, { duration: 0.6, rotation: Math.PI / 180 * -30 });

			this.particlesPause();
		})
		actionButton.on("mouseup", () => {
			gsap.to(actionButton, { duration: 0.3, alpha: 1 });
			
			// bikeLeverImage.rotation = 0; 
			gsap.to(this.bikeLeverImage, { duration: 0.6, rotation: 0 });

			this.particlesStart();
		})
	}

	createParticles() {
		let particlesContainer = this.particlesContainer;

		// 动效小技巧，与其想着怎么转动单个粒子，可以简单的转动整个粒子容器
		particlesContainer.rotation = Math.PI / 180 * 35;

		// 改变粒子容器的旋转中心，并移动粒子容器到页面中
		particlesContainer.pivot.x = window.innerWidth / 2;
		particlesContainer.pivot.y = window.innerHeight / 2;
		particlesContainer.x = window.innerWidth / 2;
		particlesContainer.y = window.innerHeight / 2;

		// 创建粒子数组
    let particles = [];

		// 粒子有多个颜色
		const colors = [0xf1cf54, 0xb5cea8, 0xf1cf54, 0x818181, 0x000000];

		for (let i = 0; i < 20; i++){
			let gr = new PIXI.Graphics();

			gr.beginFill(colors[Math.floor(Math.random() * colors.length)]);
			gr.drawCircle(0, 0, 6);
			gr.endFill();

			let pItem = {
				// 初始坐标
				sx: Math.random() * window.innerWidth,
				sy: Math.random() * window.innerHeight,
				// 粒子实例本身
				gr: gr
			}

			gr.x = pItem.sx;
			gr.y = pItem.sy;

			particlesContainer.addChild(gr);
			particles.push(pItem);
		}

    // 实现粒子动效
		let speed = 0;
		function loop() {
		  // 向某一角度持续移动
		  // 超出边界后回到顶部继续移动
		  // 按住鼠标停止
		  // 停止的时候还有一点回弹的效果
		  // 松开鼠标继续

			speed += 0.5;
			speed = Math.min(speed, 20); // 不能太快，最大值为20

			for (let i = 0; i < particles.length; i++) {
				let pItem = particles[i];
				pItem.gr.y += speed; // 速度由慢变快

				if (speed >= 20) {
					// 动效小技巧，粒子变成粒子线：x 0.1，让线有颗粒感：x 0.03
					pItem.gr.scale.x = 0.03;
					pItem.gr.scale.y = 30; // 让线条感更长
				}

				if (pItem.gr.y > window.innerHeight) pItem.gr.y = 0;
			}
		}

		function start() {
			speed = 0;
			gsap.ticker.add(loop);
		}

		function pause() {
			gsap.ticker.remove(loop);
				
			for (let i = 0; i < particles.length; i++) {
				let pItem = particles[i];

				// 暂停刹车后，显示静止粒子
				pItem.gr.scale.x = 1;
				pItem.gr.scale.y = 1;

				// 'elastic.out' 一点回弹的效果
				gsap.to(pItem.gr, {duration:0.6, x:pItem.sx, y:pItem.sy, ease:'elastic.out'});
			}
		}

		start()

		this.particlesStart = start;
		this.particlesPause = pause;
	}

	createBike() {
		let bikeContainer = this.bikeContainer;

		// 车身尺寸大，缩放容器大小使图片在页面可见
		bikeContainer.scale.x = bikeContainer.scale.y = 0.3;

		let bikeImage = new PIXI.Sprite(this.loader.resources['brake_bike.png'].texture);
		// 保存一下，为后面动效做准备
		this.bikeLeverImage = new PIXI.Sprite(this.loader.resources['brake_lever.png'].texture);
		let bikeHandlerbarImage = new PIXI.Sprite(this.loader.resources['brake_handlerbar.png'].texture);
		bikeContainer.addChild(bikeImage);
		bikeContainer.addChild(this.bikeLeverImage);
		bikeContainer.addChild(bikeHandlerbarImage);

		// 设置刹车杆旋转的轴心，为之后刹车动效做准备
		this.bikeLeverImage.pivot.x = 455;
		this.bikeLeverImage.pivot.y = 455;

		// 设置刹车杆位置到与车把手相连，没有尺寸可在ps中量一下
		this.bikeLeverImage.x = 722;
		this.bikeLeverImage.y = 900;
	}

	createActionButton() {
		let actionButton = this.actionButton;

		// 缩放容器大小
		actionButton.scale.x = actionButton.scale.y = 0.4;

		// 从加载器中取出按钮相关图片并放入容器中
		let btnImage = new PIXI.Sprite(this.loader.resources['btn.png'].texture);
		let btnCircle = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture);
		let btnCircle2 = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture);
		actionButton.addChild(btnImage);
		actionButton.addChild(btnCircle);
		actionButton.addChild(btnCircle2);

		// 改变按钮图片的圆心
		btnImage.pivot.x = btnImage.pivot.y = btnImage.width / 2;
		btnCircle.pivot.x = btnCircle.pivot.y = btnCircle.width / 2;
		btnCircle2.pivot.x = btnCircle2.pivot.y = btnCircle2.width / 2;

		// 给按钮的btnCircle添加动画，从0.8大小增大到1.3，该过程无限循环
		btnCircle.scale.x = btnCircle.scale.y = 0.8;
		gsap.to(btnCircle.scale, { duration: 1, x: 1.3, y: 1.3, repeat: -1 });
		gsap.to(btnCircle, { duration: 1, alpha: 0, repeat: -1 });
	}
}
