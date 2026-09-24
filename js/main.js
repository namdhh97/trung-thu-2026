(() => {
  const STORAGE_KEY = 'nguyet_dang_saved_wishes_v3';
  const AMBIENT_LANTERN_COUNT = window.innerWidth < 640 ? 12 : 18;

  const $ = (id) => document.getElementById(id);
  const introScene = $('introScene');
  const flightScene = $('flightScene');
  const palaceScene = $('palaceScene');
  const releaseBtn = $('releaseBtn');
  const restartBtn = $('restartBtn');
  const viewWishesBtn = $('viewWishesBtn');
  const closeSavedWishes = $('closeSavedWishes');
  const savedWishesModal = $('savedWishesModal');
  const savedWishesList = $('savedWishesList');
  const wishBadge = $('wishBadge');
  const wishLanterns = $('wishLanterns');
  const fortuneModal = $('fortuneModal');
  const fortuneImage = $('fortuneImage');
  const wishModal = $('wishModal');
  const closeFortune = $('closeFortune');
  const closeWish = $('closeWish');
  const anotherFortuneBtn = $('anotherFortuneBtn');
  const writeWishBtn = $('writeWishBtn');
  const sendWishBtn = $('sendWishBtn');
  const wishInput = $('wishInput');
  const wishCount = $('wishCount');
  const wishFlightLayer = $('wishFlightLayer');
  const soundToggle = $('soundToggle');
  const toast = $('toast');

  let isTransitioning = false;
  let audioCtx = null;
  let soundOn = false;
  let savedWishes = loadSavedWishes();
  let lastThemeKey = null;

  // Ảnh quẻ: random độc lập với nội dung, được phép lặp lại.
  // Muốn thêm ảnh chỉ cần copy file vào assets/fortune và thêm đường dẫn vào mảng này.
  const FORTUNE_IMAGES = Array.from({ length: 13 }, (_, i) =>
    `assets/fortune/fortune-${String(i + 1).padStart(2, '0')}.png`
  );

  // 8 chủ đề đã chốt. Nội dung KHÔNG nằm trong một danh sách quẻ cố định.
  // Mỗi lần mở quẻ sẽ ghép ngẫu nhiên nhiều lớp câu, tạo ra số lượng tổ hợp rất lớn.
  const FORTUNE_THEMES = {
    an: {
      name: 'QUẺ AN', symbol: '「 AN 」',
      poemA: ['Trăng thanh soi lối', 'Mây nhẹ qua hiên', 'Gió thu dịu xuống', 'Đèn vàng soi ngõ', 'Sương khuya lắng lại'],
      poemB: ['lòng người thêm tĩnh', 'bình yên ghé gần', 'muộn phiền dần xa', 'tâm trí sáng trong', 'đường về thêm ấm'],
      opening: [
        'Nhịp sống của bạn đang cần một khoảng lặng vừa đủ.',
        'Điều khiến bạn băn khoăn sẽ dần lắng xuống khi bạn không ép mình phải giải quyết tất cả cùng lúc.',
        'Một giai đoạn nhẹ nhàng hơn đang mở ra nếu bạn biết giữ nhịp cho chính mình.',
        'Sự bình tĩnh lúc này quý hơn tốc độ.',
        'Có những việc chỉ cần thêm thời gian là sẽ tự sáng rõ.'
      ],
      direction: [
        'Hãy ưu tiên điều thực sự quan trọng và bỏ bớt những lo lắng không thuộc trách nhiệm của bạn.',
        'Một cuộc trò chuyện chân thành hoặc một giấc nghỉ đủ sâu sẽ giúp bạn nhìn mọi chuyện khác đi.',
        'Đừng ngại đi chậm hơn một chút để giữ sự cân bằng.',
        'Bạn nên dành thời gian cho gia đình, sức khỏe và những người khiến mình cảm thấy an tâm.',
        'Tin vào những tín hiệu bình dị thay vì chạy theo quá nhiều đáp án cùng lúc.'
      ],
      ending: [
        'Bình an sẽ đến từ cách bạn lựa chọn phản ứng.',
        'Khi lòng yên, hướng đi cũng tự nhiên rõ hơn.',
        'Điều tốt đẹp đang đến theo một cách rất nhẹ nhàng.',
        'Bạn không cần hoàn hảo để có một ngày đủ đầy.',
        'Trăng vẫn sáng ngay cả khi đôi lúc mây che.'
      ],
      whispers: [
        '“Tâm an thì trăng nào cũng sáng.”',
        '“Chậm một chút cũng không sao, miễn là lòng mình không lạc.”',
        '“Bình yên là khi biết điều gì nên giữ và điều gì nên buông.”',
        '“Đừng vội tìm câu trả lời trong lúc lòng còn nhiều tiếng động.”',
        '“Một đêm ngon giấc đôi khi cũng là một lời giải.”'
      ]
    },
    duyen: {
      name: 'QUẺ DUYÊN', symbol: '「 DUYÊN 」',
      poemA: ['Nguyệt viên hữu ý', 'Đèn hồng gặp gió', 'Mây trôi gặp nguyệt', 'Hoa nở đúng mùa', 'Người qua đúng ngõ'],
      poemB: ['nhân ngộ hữu duyên', 'tương phùng đúng lúc', 'lòng gặp lòng thôi', 'duyên lành ghé tới', 'câu chuyện bắt đầu'],
      opening: [
        'Một kết nối đáng quý có thể đang ở gần hơn bạn nghĩ.',
        'Duyên tốt thường xuất hiện khi cả hai phía đều đủ chân thành.',
        'Có một mối quan hệ đang cần thêm sự rõ ràng hơn là suy đoán.',
        'Một cuộc gặp gỡ tưởng như tình cờ có thể mang theo ý nghĩa lâu dài.',
        'Bạn đang bước vào giai đoạn dễ mở lòng và dễ được thấu hiểu hơn.'
      ],
      direction: [
        'Hãy để mọi thứ phát triển tự nhiên thay vì cố định nghĩa quá sớm.',
        'Chủ động một lời hỏi thăm có thể mở ra một câu chuyện đẹp.',
        'Đừng bỏ qua những người luôn hiện diện bằng hành động nhỏ.',
        'Nếu có điều cần nói, sự chân thành sẽ tốt hơn những phép thử.',
        'Giữ tiêu chuẩn của mình nhưng cũng cho người khác cơ hội được hiểu bạn.'
      ],
      ending: [
        'Duyên đẹp nhất là duyên khiến cả hai đều thấy nhẹ lòng.',
        'Người phù hợp không làm bạn phải đoán quá nhiều.',
        'Một mối quan hệ tốt luôn cần thời gian để bén rễ.',
        'Đúng người, đúng lúc thường bắt đầu bằng một điều rất bình thường.',
        'Hãy để sự tử tế dẫn đường.'
      ],
      whispers: [
        '“Duyên đẹp nhất là duyên đến đúng lúc.”',
        '“Có những người gặp nhau để cùng làm một đoạn đời dịu hơn.”',
        '“Đừng tìm tín hiệu quá xa khi sự chân thành đang ở ngay trước mắt.”',
        '“Một lời thật lòng quý hơn trăm lần thử lòng.”',
        '“Người cần gặp rồi sẽ gặp, điều cần hiểu rồi sẽ hiểu.”'
      ]
    },
    tri: {
      name: 'QUẺ TRÍ', symbol: '「 TRÍ 」',
      poemA: ['Tâm tĩnh thì sáng', 'Đọc trang thêm hiểu', 'Đêm sâu đèn sáng', 'Chậm mà chắc bước', 'Một chữ gieo hôm nay'],
      poemB: ['học bền thì thông', 'ngày mai thành trí', 'ý mới nảy mầm', 'đường dài hóa gần', 'mai thành ngàn chữ'],
      opening: [
        'Bạn đang ở gần một điểm bứt phá trong việc học hoặc một kỹ năng mới.',
        'Điều khó hiện tại thực ra cần được chia nhỏ hơn.',
        'Kiến thức bạn tích lũy gần đây sắp kết nối thành một bức tranh rõ ràng.',
        'Một phương pháp học mới sẽ hiệu quả hơn việc cố gắng thêm giờ.',
        'Sự tò mò của bạn đang dẫn đúng hướng.'
      ],
      direction: [
        'Hãy tập trung vào một mục tiêu nhỏ mỗi ngày và ghi lại tiến bộ.',
        'Thử giải thích điều đã học bằng ngôn ngữ thật đơn giản để kiểm tra mức độ hiểu.',
        'Đừng sợ hỏi lại điều cơ bản; nền móng chắc sẽ giúp bạn đi nhanh hơn về sau.',
        'Kết hợp thực hành ngay sau khi học sẽ giúp kiến thức bền hơn.',
        'Một người hướng dẫn hoặc bạn học phù hợp có thể giúp bạn tiết kiệm rất nhiều thời gian.'
      ],
      ending: [
        'Kiên trì sẽ biến điều khó thành điều quen.',
        'Mỗi ngày hiểu thêm một chút đã là tiến bộ thật.',
        'Đừng so tốc độ học của bạn với hành trình của người khác.',
        'Điều bạn học hôm nay sẽ sớm có chỗ để sử dụng.',
        'Tri thức tích lũy chậm nhưng tạo thay đổi rất dài.'
      ],
      whispers: [
        '“Học một điều cho thật chắc còn hơn biết mười điều thật mờ.”',
        '“Mỗi ngày hiểu thêm một chút, rồi sẽ thành một chặng dài.”',
        '“Câu hỏi tốt đôi khi quan trọng hơn câu trả lời nhanh.”',
        '“Đi chậm ở phần nền để đi nhanh ở đoạn sau.”',
        '“Kiến thức chỉ thật sự thuộc về bạn khi bạn dùng được nó.”'
      ]
    },
    loc: {
      name: 'QUẺ LỘC', symbol: '「 LỘC 」',
      poemA: ['Đường xa có sáng', 'Lộc non vừa nhú', 'Đèn lên đúng gió', 'Công vun thành quả', 'Hạt gieo gặp đất'],
      poemB: ['công thành có ngày', 'việc tốt sinh sôi', 'cơ hội ghé gần', 'thành tựu đến tay', 'mùa lành sắp tới'],
      opening: [
        'Công việc bạn theo đuổi đang tiến triển dù kết quả chưa hiện rõ hoàn toàn.',
        'Một cơ hội mới có thể đến từ chính việc bạn đang làm đều đặn mỗi ngày.',
        'Nguồn lực hoặc sự hỗ trợ bạn cần đang dần xuất hiện.',
        'Có tín hiệu tốt liên quan đến công việc, thu nhập hoặc một kế hoạch cá nhân.',
        'Sự bền bỉ gần đây của bạn đang tích lại thành lợi thế.'
      ],
      direction: [
        'Hãy hoàn thành thật tốt việc đang dang dở trước khi mở thêm quá nhiều hướng mới.',
        'Chủ động kết nối với người có thể bổ sung kỹ năng hoặc nguồn lực mà bạn thiếu.',
        'Theo dõi con số và kết quả thực tế thay vì chỉ dựa vào cảm giác.',
        'Một bước nhỏ nhưng đúng thời điểm sẽ có giá trị hơn một kế hoạch quá lớn nhưng chậm bắt đầu.',
        'Giữ uy tín trong những việc nhỏ vì đó có thể là lý do cơ hội lớn tìm đến.'
      ],
      ending: [
        'Thành quả sẽ đến từ chuỗi hành động đều đặn.',
        'Đừng bỏ cuộc ngay trước lúc ánh trăng lên.',
        'Cơ hội tốt thường ưu tiên người đã chuẩn bị sẵn.',
        'Điều bạn vun hôm nay có thể thành lộc của ngày mai.',
        'Lộc bền luôn đi cùng năng lực và sự tử tế.'
      ],
      whispers: [
        '“Lộc đến với người biết giữ nhịp và giữ chữ tín.”',
        '“Đừng bỏ cuộc ngay trước lúc ánh trăng lên.”',
        '“Cơ hội thích những người đã sẵn sàng.”',
        '“Làm tốt việc nhỏ, việc lớn sẽ tự tìm đường tới.”',
        '“Bền bỉ hôm nay là may mắn của ngày mai.”'
      ]
    },
    phuc: {
      name: 'QUẺ PHÚC', symbol: '「 PHÚC 」',
      poemA: ['Đèn sáng trước hiên', 'Nhà vui trăng sáng', 'Hoa đăng đầy ngõ', 'Tiếng cười bên cửa', 'Trăng lên mái ấm'],
      poemB: ['phúc lành ghé cửa', 'ấm lòng đoàn viên', 'tin vui ghé nhà', 'người thân sum vầy', 'bình yên ở lại'],
      opening: [
        'Một niềm vui nhỏ đang có xu hướng lan thành nhiều điều tốt đẹp hơn.',
        'Gia đình hoặc những người thân cận sẽ là nguồn năng lượng tích cực cho bạn.',
        'Bạn đang có nhiều điều đáng quý hơn những gì mình thường để ý.',
        'Một lời cảm ơn, một cuộc gặp hoặc một tin vui có thể làm ngày sắp tới đặc biệt hơn.',
        'Phúc khí của quẻ này nằm ở sự đủ đầy trong những điều giản dị.'
      ],
      direction: [
        'Hãy dành thời gian cho người mình thương thay vì chờ một dịp hoàn hảo.',
        'Chia sẻ một niềm vui nhỏ sẽ khiến nó trở nên lớn hơn.',
        'Đừng quên nói lời cảm ơn với người luôn âm thầm hỗ trợ bạn.',
        'Một bữa cơm, một cuộc gọi hoặc một buổi gặp ngắn có thể rất đáng nhớ.',
        'Giữ sự rộng lượng trong cách nhìn người và nhìn đời.'
      ],
      ending: [
        'Biết đủ là một dạng giàu có.',
        'Phúc thường ở ngay trong những điều ta quen thuộc nhất.',
        'Niềm vui được sẻ chia sẽ ở lại lâu hơn.',
        'Gia đình bình an đã là một mùa trăng trọn vẹn.',
        'Điều tốt đẹp nhất đôi khi không cần quá lớn.'
      ],
      whispers: [
        '“Biết đủ là phúc, biết thương là duyên.”',
        '“Nhà có tiếng cười thì đêm nào cũng có trăng.”',
        '“Phúc là khi quay về vẫn có người hỏi hôm nay thế nào.”',
        '“Niềm vui nhỏ được chia đôi lại hóa thành niềm vui lớn.”',
        '“Đoàn viên không nằm ở khoảng cách mà ở lòng người.”'
      ]
    },
    vien: {
      name: 'QUẺ VIÊN', symbol: '「 VIÊN 」',
      poemA: ['Trăng tròn trên đỉnh', 'Nguyệt mãn trời thu', 'Mâm trà đủ vị', 'Đèn tụ thành vòng', 'Người về chung mái'],
      poemB: ['người thương bên nhà', 'lòng người đủ đầy', 'câu chuyện trọn vẹn', 'đoàn viên thành hội', 'mùa thu thêm ấm'],
      opening: [
        'Một việc dang dở có khả năng đi đến đoạn hoàn thiện nếu bạn kiên nhẫn thêm một chút.',
        'Quẻ Viên nhắc bạn nhìn lại những gì đã có trước khi tiếp tục tìm điều còn thiếu.',
        'Bạn đang tiến gần hơn tới cảm giác trọn vẹn trong một mối quan hệ hoặc kế hoạch quan trọng.',
        'Một vòng tròn cũ đang khép lại để nhường chỗ cho chu kỳ mới.',
        'Có điều tưởng chưa hoàn hảo nhưng thực ra đã đủ để bạn bước tiếp.'
      ],
      direction: [
        'Hãy hoàn tất những lời hứa nhỏ và những việc còn bỏ ngỏ.',
        'Dành một khoảnh khắc để ghi nhận chặng đường mình đã đi.',
        'Đừng vì một chi tiết chưa như ý mà phủ nhận toàn bộ thành quả.',
        'Một cuộc đoàn tụ hoặc gặp lại sẽ giúp bạn nhìn rõ điều thật sự quan trọng.',
        'Học cách kết thúc đẹp cũng quan trọng như bắt đầu tốt.'
      ],
      ending: [
        'Sự viên mãn không nhất thiết là có tất cả.',
        'Đủ đầy là khi biết mình đang muốn giữ điều gì.',
        'Một chương khép lại đúng lúc sẽ làm chương mới nhẹ hơn.',
        'Nơi có người chờ, nơi đó là đoàn viên.',
        'Trăng tròn vì đã đi qua đủ những ngày khuyết.'
      ],
      whispers: [
        '“Nơi có người chờ, nơi đó là đoàn viên.”',
        '“Trăng tròn không phải vì chưa từng khuyết.”',
        '“Đủ không phải là nhiều, đủ là vừa với lòng.”',
        '“Khép lại một điều tử tế cũng là mở ra một điều lành.”',
        '“Đoàn viên là được trở về nơi mình không cần gồng lên.”'
      ]
    },
    nguyen: {
      name: 'QUẺ NGUYỆN', symbol: '「 NGUYỆN 」',
      poemA: ['Đèn bay theo gió', 'Ước gửi lên trăng', 'Một lời gửi nguyệt', 'Đêm rằm giữ ước', 'Ngọn đèn vừa sáng'],
      poemB: ['ước gửi theo trăng', 'ngày mai thành bước', 'mong cầu có lối', 'hy vọng nảy mầm', 'đường xa bớt tối'],
      opening: [
        'Điều bạn mong muốn có thể tiến gần hơn nếu được biến thành một hành động cụ thể.',
        'Ước nguyện này không xa vời, nhưng cần một bước đầu tiên rõ ràng.',
        'Bạn đang có đủ lý do để bắt đầu thay vì chờ thêm một thời điểm hoàn hảo.',
        'Một dự định từng để trong lòng đang đến lúc được đưa ra ánh sáng.',
        'Quẻ Nguyện khuyến khích bạn tin vào mong muốn của mình nhưng vẫn giữ đôi chân trên mặt đất.'
      ],
      direction: [
        'Hãy chọn một việc có thể làm trong 24 giờ tới để tiến gần mục tiêu.',
        'Viết điều mình muốn thành một kế hoạch có mốc thời gian.',
        'Chia mong muốn lớn thành ba bước đủ nhỏ để bắt đầu.',
        'Nói với một người đáng tin về mục tiêu để tạo thêm cam kết.',
        'Đừng chờ hết sợ mới bắt đầu; hãy bắt đầu khi vẫn còn một chút sợ.'
      ],
      ending: [
        'Ước nguyện đẹp nhất là ước nguyện có bước chân đi cùng.',
        'Trăng có thể soi đường, nhưng bước đi vẫn là của bạn.',
        'Một hành động nhỏ hôm nay đáng giá hơn một lời hứa lớn để ngày mai.',
        'Mong cầu sẽ rõ hơn khi bạn bắt đầu làm.',
        'Điều ước có sức mạnh nhất khi được nuôi bằng hành động.'
      ],
      whispers: [
        '“Ước nguyện đẹp nhất là ước nguyện có bước chân đi cùng.”',
        '“Hãy gửi ước lên trăng rồi gửi bước chân xuống đất.”',
        '“Bắt đầu nhỏ vẫn là bắt đầu.”',
        '“Đừng chờ hoàn hảo mới cho phép mình tiến lên.”',
        '“Một ngọn đèn chỉ cần được thắp là đã có thể soi một đoạn đường.”'
      ]
    },
    tam: {
      name: 'QUẺ TÂM', symbol: '「 TÂM 」',
      poemA: ['Mây qua rồi nhẹ', 'Một niệm lắng xuống', 'Lòng như mặt nước', 'Gió dừng bên hiên', 'Trăng soi đáy mắt'],
      poemB: ['lòng tĩnh rồi an', 'muộn phiền hóa nhẹ', 'thấy mình rõ hơn', 'tâm lại thảnh thơi', 'một niềm bình yên'],
      opening: [
        'Bạn đang cần lắng nghe cảm xúc của mình thay vì cố gắng hợp lý hóa mọi thứ.',
        'Có một điều bạn đã giữ trong lòng hơi lâu.',
        'Tâm trí có thể đang quá đầy vì quá nhiều việc cùng chen vào.',
        'Quẻ Tâm xuất hiện khi bạn cần quay về với nhu cầu thật của chính mình.',
        'Một quyết định sẽ dễ hơn sau khi bạn phân biệt được điều mình muốn và điều người khác mong ở mình.'
      ],
      direction: [
        'Hãy viết ra ba điều đang làm bạn nặng lòng và chọn xử lý từng việc một.',
        'Cho phép mình nghỉ mà không biến khoảng nghỉ thành cảm giác có lỗi.',
        'Nói điều cần nói bằng sự mềm mại nhưng rõ ràng.',
        'Giảm bớt tiếng ồn xung quanh để nghe lại suy nghĩ của bản thân.',
        'Hãy bảo vệ thời gian và năng lượng của mình bằng những ranh giới hợp lý.'
      ],
      ending: [
        'Khi hiểu mình, bạn sẽ bớt cần người khác xác nhận.',
        'Lòng nhẹ đi thì đường trước mắt cũng rộng hơn.',
        'Không phải điều gì cũng cần phản ứng ngay lập tức.',
        'Bạn có quyền chọn bình yên thay vì tranh đúng sai.',
        'Tử tế với chính mình không phải là ích kỷ.'
      ],
      whispers: [
        '“Mây qua rồi nhẹ, lòng tĩnh rồi an.”',
        '“Không phải mọi tiếng gọi đều cần bạn trả lời.”',
        '“Hiểu lòng mình là một loại sáng suốt.”',
        '“Có những ngày, nghỉ ngơi cũng là một việc cần hoàn thành.”',
        '“Giữ lòng mềm nhưng đừng quên giữ ranh giới.”'
      ]
    }
  };

  const THEME_KEYS = Object.keys(FORTUNE_THEMES);

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomThemeKey(except = null) {
    if (THEME_KEYS.length < 2) return THEME_KEYS[0];
    let key = pick(THEME_KEYS);
    while (except && key === except) key = pick(THEME_KEYS);
    return key;
  }

  function generateFortune(themeKey = randomThemeKey()) {
    const theme = FORTUNE_THEMES[themeKey] || FORTUNE_THEMES.an;
    return {
      themeKey,
      name: theme.name,
      symbol: theme.symbol,
      poem: `${pick(theme.poemA)}, ${pick(theme.poemB)}.`,
      message: `${pick(theme.opening)} ${pick(theme.direction)} ${pick(theme.ending)}`,
      whisper: pick(theme.whispers),
      image: pick(FORTUNE_IMAGES)
    };
  }

  function buildStars() {
    const stars = $('stars');
    const count = window.innerWidth < 600 ? 70 : 115;
    stars.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 86}%`;
      s.style.opacity = (0.25 + Math.random() * 0.75).toFixed(2);
      s.style.setProperty('--dur', `${2 + Math.random() * 4}s`);
      const size = Math.random() > .85 ? 3 : 2;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      stars.appendChild(s);
    }
  }

  function applyRandomLanternPath(el, initial = false) {
    const duration = randomBetween(10.5, 18.5);
    el.style.left = `${randomBetween(4, 94).toFixed(2)}%`;
    el.style.setProperty('--riseDur', `${duration.toFixed(2)}s`);
    el.style.setProperty('--delay', `${(initial ? randomBetween(-duration, 0) : 0).toFixed(2)}s`);
    el.style.setProperty('--scale', randomBetween(.82, 1.28).toFixed(2));
    el.style.setProperty('--drift', `${randomBetween(-60, 60).toFixed(0)}px`);
    el.dataset.theme = randomThemeKey();
    el.setAttribute('aria-label', `Mở ${FORTUNE_THEMES[el.dataset.theme].name}`);
  }

  function createLantern() {
    const btn = document.createElement('button');
    btn.className = 'wish-lantern';
    btn.type = 'button';
    btn.innerHTML = '<span class="cap"></span><span class="fortune-dot"></span>';
    applyRandomLanternPath(btn, true);

    btn.addEventListener('click', () => {
      softChime(620, .12);
      showFortune(btn.dataset.theme || randomThemeKey());
    });

    btn.addEventListener('animationiteration', () => applyRandomLanternPath(btn, false));
    return btn;
  }

  function buildLanterns() {
    wishLanterns.innerHTML = '';
    for (let i = 0; i < AMBIENT_LANTERN_COUNT; i++) wishLanterns.appendChild(createLantern());
  }

  function setScene(scene) {
    [introScene, flightScene, palaceScene].forEach((s) => s.classList.remove('is-active'));
    scene.classList.add('is-active');
  }

  function startJourney() {
    if (isTransitioning) return;
    isTransitioning = true;
    softChime(440, .16);
    setScene(flightScene);
    requestAnimationFrame(() => flightScene.classList.add('is-flying'));

    setTimeout(() => softChime(523.25, .16), 900);
    setTimeout(() => softChime(659.25, .18), 1850);
    setTimeout(() => softChime(783.99, .22), 2900);

    setTimeout(() => {
      flightScene.classList.remove('is-flying');
      setScene(palaceScene);
      isTransitioning = false;
      showToast('Chào mừng bạn đến Cung Trăng ✨');
    }, 4100);
  }

  function restart() {
    if (isTransitioning) return;
    closeAllModals();
    setScene(introScene);
    showToast('Hẹn gặp lại trên Cung Trăng 🌕');
  }

  function showFortune(themeKey = randomThemeKey()) {
    const f = generateFortune(themeKey);
    lastThemeKey = f.themeKey;
    $('fortuneTitle').textContent = f.name;
    $('fortuneSymbol').textContent = f.symbol;
    $('fortunePoem').textContent = f.poem;
    $('fortuneMessage').textContent = f.message;
    $('fortuneWhisper').textContent = f.whisper;
    fortuneImage.src = f.image;
    fortuneImage.alt = `Ảnh Trung Thu đi kèm ${f.name}`;
    fortuneModal.classList.add('is-open');
    fortuneModal.setAttribute('aria-hidden', 'false');
  }

  function showRandomFortune() {
    showFortune(randomThemeKey(lastThemeKey));
    softChime(700, .12);
  }

  function closeFortuneModal() {
    fortuneModal.classList.remove('is-open');
    fortuneModal.setAttribute('aria-hidden', 'true');
  }

  function openWishModal() {
    wishModal.classList.add('is-open');
    wishModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => wishInput.focus(), 200);
  }

  function closeWishModal() {
    wishModal.classList.remove('is-open');
    wishModal.setAttribute('aria-hidden', 'true');
  }

  function openSavedWishesModal() {
    renderSavedWishes();
    savedWishesModal.classList.add('is-open');
    savedWishesModal.setAttribute('aria-hidden', 'false');
  }

  function closeSavedWishesModal() {
    savedWishesModal.classList.remove('is-open');
    savedWishesModal.setAttribute('aria-hidden', 'true');
  }

  function closeAllModals() {
    closeFortuneModal();
    closeWishModal();
    closeSavedWishesModal();
  }

  function loadSavedWishes() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persistWishes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedWishes));
      return true;
    } catch {
      return false;
    }
  }

  function formatTime(value) {
    try {
      return new Date(value).toLocaleString('vi-VN');
    } catch {
      return '';
    }
  }

  function updateWishBadge() {
    wishBadge.textContent = String(savedWishes.length);
  }

  function renderSavedWishes() {
    updateWishBadge();
    if (!savedWishes.length) {
      savedWishesList.innerHTML = '<div class="saved-empty">Bạn chưa lưu ước nguyện nào.<br>Hãy gửi một chiếc đèn để bắt đầu nhé 🏮</div>';
      return;
    }

    savedWishesList.innerHTML = savedWishes.map((item, index) => `
      <article class="saved-wish-item">
        <div class="saved-wish-head">
          <span>Ước nguyện #${savedWishes.length - index}</span>
          <time>${formatTime(item.createdAt)}</time>
        </div>
        <div class="saved-wish-text">${escapeHtml(item.text)}</div>
      </article>
    `).join('');
  }

  function saveWish(text) {
    savedWishes.unshift({ id: Date.now(), text, createdAt: new Date().toISOString() });
    if (savedWishes.length > 100) savedWishes = savedWishes.slice(0, 100);
    const ok = persistWishes();
    renderSavedWishes();
    return ok;
  }

  function launchWishLantern(text) {
    const lantern = document.createElement('div');
    lantern.className = 'user-wish-lantern';
    lantern.innerHTML = `<span class="wish-paper">${escapeHtml(text.slice(0, 20))}</span>`;
    wishFlightLayer.appendChild(lantern);
    setTimeout(() => lantern.remove(), 5200);
  }

  function sendWish() {
    const text = wishInput.value.trim();
    if (!text) {
      showToast('Hãy viết một điều ước trước khi thả đèn nhé 🏮');
      wishInput.focus();
      return;
    }

    const saved = saveWish(text);
    closeWishModal();
    softChime(523.25, .15);
    setTimeout(() => softChime(659.25, .15), 160);
    setTimeout(() => softChime(880, .2), 340);
    launchWishLantern(text);

    showToast(saved
      ? 'Đã lưu ước nguyện và gửi chiếc đèn lên Cung Trăng ✨'
      : 'Đã thả đèn, nhưng trình duyệt đang chặn lưu cục bộ.');

    wishInput.value = '';
    updateWishCount();
  }

  function updateWishCount() {
    wishCount.textContent = `${wishInput.value.length}/120`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function ensureAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function softChime(freq = 523.25, duration = .14) {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.06, ctx.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + .03);
  }

  function toggleSound() {
    soundOn = !soundOn;
    soundToggle.classList.toggle('is-on', soundOn);
    soundToggle.textContent = soundOn ? '♫' : '♪';
    if (soundOn) {
      ensureAudio();
      softChime(659.25, .18);
      showToast('Đã bật âm thanh ✨');
    } else {
      showToast('Đã tắt âm thanh');
    }
  }

  releaseBtn.addEventListener('click', startJourney);
  restartBtn.addEventListener('click', restart);
  viewWishesBtn.addEventListener('click', openSavedWishesModal);
  closeSavedWishes.addEventListener('click', closeSavedWishesModal);
  closeFortune.addEventListener('click', closeFortuneModal);
  anotherFortuneBtn.addEventListener('click', showRandomFortune);
  writeWishBtn.addEventListener('click', openWishModal);
  closeWish.addEventListener('click', closeWishModal);
  sendWishBtn.addEventListener('click', sendWish);
  wishInput.addEventListener('input', updateWishCount);
  soundToggle.addEventListener('click', toggleSound);

  [fortuneModal, wishModal, savedWishesModal].forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  buildStars();
  buildLanterns();
  renderSavedWishes();
  updateWishCount();
  updateWishBadge();
})();
