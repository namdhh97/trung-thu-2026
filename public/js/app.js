(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const introScene=$('introScene'), flightScene=$('flightScene'), palaceScene=$('palaceScene');
  const lanternField=$('lanternField'), fortuneModal=$('fortuneModal'), luckyVoucherModal=$('luckyVoucherModal'), wishModal=$('wishModal'), wishesModal=$('wishesModal');
  const bgMusic=$('bgMusic');
  const guideBubble=$('guideBubble'), guideToggle=$('guideToggle');
  const characterCuoi=$('characterCuoi'), characterHang=$('characterHang');
  const cuoiBubble=$('cuoiBubble'), hangBubble=$('hangBubble');
  const LOCAL_KEY='nguyet_dang_wishes_final';
  const SENDER_KEY='nguyet_dang_sender_name';
  const FORTUNE_MODE_KEY='nguyet_dang_fortune_mode';
  const LANTERN_COUNT=window.innerWidth<560?10:16;
  const LANTERNS=['assets/lanterns/lantern-01.png','assets/lanterns/lantern-02.png','assets/lanterns/lantern-03.png'];
  const FORTUNE_IMAGES=['assets/fortune/fortune-01.png','assets/fortune/fortune-02.png','assets/fortune/fortune-03.png','assets/fortune/fortune-04.png','assets/fortune/fortune-05.png','assets/fortune/fortune-06.png','assets/fortune/fortune-07.png','assets/fortune/fortune-08.png','assets/fortune/fortune-09.png','assets/fortune/fortune-10.png','assets/fortune/fortune-11.png','assets/fortune/fortune-12.png','assets/fortune/fortune-13.png'];
  const CUOI_LINES=['Chú Cuội chúc bạn đêm rằm thật ấm áp, điều mong đều dần thành thật.','Chú Cuội gửi bạn một nhành may mắn, mong lòng an và nhà luôn vui.','Chú Cuội nhắn rằng cứ giữ thiện tâm, trăng sáng sẽ soi đường lành cho bạn.'];
  const HANG_LINES=['Chị Hằng chúc bạn một mùa Trung Thu dịu dàng, đủ đầy yêu thương.','Chị Hằng gửi bạn ánh trăng an lành, mong mọi điều tốt đẹp ghé bên hiên nhà.','Chị Hằng mong bạn giữ nụ cười thật sáng, để đêm rằm nào cũng thành đoàn viên.'];
  const PROMO=window.NGUYET_DANG_PROMO||{};
  let soundOn=true, toastTimer=null, apiMode='checking', pendingFortuneTheme=null, currentVoucherClaim='';
  let fortuneMode=localStorage.getItem(FORTUNE_MODE_KEY)||'';
  const PAGE_PARAMS=new URLSearchParams(location.search);
  const VOUCHER_TEST_KEY=String(PAGE_PARAMS.get('testVoucher')||'').trim();
  const IS_LOCAL_TEST=['localhost','127.0.0.1'].includes(location.hostname)&&VOUCHER_TEST_KEY==='1';
  const IS_REMOTE_TEST=!['localhost','127.0.0.1'].includes(location.hostname)&&!!VOUCHER_TEST_KEY;

  const THEMES={
    an:{name:'QUẺ AN',symbol:'「 AN 」',poemA:['Trăng thanh soi lối','Mây nhẹ qua hiên','Gió thu dịu xuống','Đèn vàng soi ngõ'],poemB:['lòng người thêm tĩnh','bình yên ghé gần','muộn phiền dần xa','đường về thêm ấm'],opening:['Nhịp sống của bạn đang cần một khoảng lặng vừa đủ.','Điều khiến bạn băn khoăn sẽ dần sáng rõ khi bạn không ép mình phải giải quyết tất cả cùng lúc.','Một giai đoạn nhẹ nhàng hơn đang mở ra nếu bạn biết giữ nhịp cho chính mình.'],direction:['Hãy ưu tiên điều thực sự quan trọng và bỏ bớt những lo lắng không thuộc trách nhiệm của bạn.','Một cuộc trò chuyện chân thành hoặc một giấc nghỉ đủ sâu sẽ giúp bạn nhìn mọi chuyện khác đi.','Đừng ngại đi chậm hơn một chút để giữ sự cân bằng.'],ending:['Khi lòng yên, hướng đi cũng tự nhiên rõ hơn.','Điều tốt đẹp đang đến theo một cách rất nhẹ nhàng.','Trăng vẫn sáng ngay cả khi đôi lúc mây che.'],whispers:['Tâm an thì trăng nào cũng sáng.','Chậm một chút cũng không sao, miễn là lòng mình không lạc.','Bình yên là khi biết điều gì nên giữ và điều gì nên buông.']},
    duyen:{name:'QUẺ DUYÊN',symbol:'「 DUYÊN 」',poemA:['Nguyệt viên hữu ý','Đèn hồng gặp gió','Mây trôi gặp nguyệt','Hoa nở đúng mùa'],poemB:['nhân ngộ hữu duyên','tương phùng đúng lúc','lòng gặp lòng thôi','duyên lành ghé tới'],opening:['Một kết nối đáng quý có thể đang ở gần hơn bạn nghĩ.','Duyên tốt thường xuất hiện khi cả hai phía đều đủ chân thành.','Một cuộc gặp gỡ tưởng như tình cờ có thể mang theo ý nghĩa lâu dài.'],direction:['Hãy để mọi thứ phát triển tự nhiên thay vì cố định nghĩa quá sớm.','Chủ động một lời hỏi thăm có thể mở ra một câu chuyện đẹp.','Đừng bỏ qua những người luôn hiện diện bằng hành động nhỏ.'],ending:['Duyên đẹp nhất là duyên khiến cả hai đều thấy nhẹ lòng.','Một mối quan hệ tốt luôn cần thời gian để bén rễ.','Hãy để sự tử tế dẫn đường.'],whispers:['Duyên đẹp nhất là duyên đến đúng lúc.','Một lời thật lòng quý hơn trăm lần thử lòng.','Người cần gặp rồi sẽ gặp, điều cần hiểu rồi sẽ hiểu.']},
    tri:{name:'QUẺ TRÍ',symbol:'「 TRÍ 」',poemA:['Tâm tĩnh thì sáng','Đọc trang thêm hiểu','Đêm sâu đèn sáng','Chậm mà chắc bước'],poemB:['học bền thì thông','ngày mai thành trí','ý mới nảy mầm','đường dài hóa gần'],opening:['Bạn đang ở gần một điểm bứt phá trong việc học hoặc một kỹ năng mới.','Điều khó hiện tại thực ra cần được chia nhỏ hơn.','Kiến thức bạn tích lũy gần đây sắp kết nối thành một bức tranh rõ ràng.'],direction:['Hãy tập trung vào một mục tiêu nhỏ mỗi ngày và ghi lại tiến bộ.','Thử giải thích điều đã học bằng ngôn ngữ thật đơn giản để kiểm tra mức độ hiểu.','Kết hợp thực hành ngay sau khi học sẽ giúp kiến thức bền hơn.'],ending:['Kiên trì sẽ biến điều khó thành điều quen.','Mỗi ngày hiểu thêm một chút đã là tiến bộ thật.','Điều bạn học hôm nay sẽ sớm có chỗ để sử dụng.'],whispers:['Học một điều cho thật chắc còn hơn biết mười điều thật mờ.','Mỗi ngày hiểu thêm một chút, rồi sẽ thành một chặng dài.','Câu hỏi tốt đôi khi quan trọng hơn câu trả lời nhanh.']},
    loc:{name:'QUẺ LỘC',symbol:'「 LỘC 」',poemA:['Đường xa có sáng','Lộc non vừa nhú','Đèn lên đúng gió','Công vun thành quả'],poemB:['công thành có ngày','việc tốt sinh sôi','cơ hội ghé gần','thành tựu đến tay'],opening:['Công việc bạn theo đuổi đang tiến triển dù kết quả chưa hiện rõ hoàn toàn.','Một cơ hội mới có thể đến từ chính việc bạn đang làm đều đặn mỗi ngày.','Sự bền bỉ gần đây của bạn đang tích lại thành lợi thế.'],direction:['Hãy hoàn thành thật tốt việc đang dang dở trước khi mở thêm quá nhiều hướng mới.','Theo dõi con số và kết quả thực tế thay vì chỉ dựa vào cảm giác.','Giữ uy tín trong những việc nhỏ vì đó có thể là lý do cơ hội lớn tìm đến.'],ending:['Thành quả sẽ đến từ chuỗi hành động đều đặn.','Đừng bỏ cuộc ngay trước lúc ánh trăng lên.','Cơ hội tốt thường ưu tiên người đã chuẩn bị sẵn.'],whispers:['Lộc đến với người biết giữ nhịp và giữ chữ tín.','Cơ hội thích những người đã sẵn sàng.','Bền bỉ hôm nay là may mắn của ngày mai.']},
    phuc:{name:'QUẺ PHÚC',symbol:'「 PHÚC 」',poemA:['Đèn sáng trước hiên','Nhà vui trăng sáng','Hoa đăng đầy ngõ','Trăng lên mái ấm'],poemB:['phúc lành ghé cửa','ấm lòng đoàn viên','tin vui ghé nhà','bình yên ở lại'],opening:['Một niềm vui nhỏ đang có xu hướng lan thành nhiều điều tốt đẹp hơn.','Gia đình hoặc những người thân cận sẽ là nguồn năng lượng tích cực cho bạn.','Bạn đang có nhiều điều đáng quý hơn những gì mình thường để ý.'],direction:['Hãy dành thời gian cho người mình thương thay vì chờ một dịp hoàn hảo.','Chia sẻ một niềm vui nhỏ sẽ khiến nó trở nên lớn hơn.','Đừng quên nói lời cảm ơn với người luôn âm thầm hỗ trợ bạn.'],ending:['Phúc đôi khi chính là những người vẫn còn ngồi cạnh mình.','Biết đủ là một cách giữ phúc rất lâu.','Điều ấm áp bạn trao đi sẽ có ngày trở lại.'],whispers:['Biết đủ là phúc, biết thương là duyên.','Nơi có người chờ, nơi đó là đoàn viên.','Phúc là khi lòng mình còn chỗ cho sự biết ơn.']},
    vien:{name:'QUẺ VIÊN',symbol:'「 VIÊN 」',poemA:['Trăng tròn trên đỉnh','Người về bên cửa','Đèn sum một lối','Mâm trăng đủ vị'],poemB:['người thương bên nhà','đoàn viên thêm ấm','tình thân đầy sân','lòng người đủ đầy'],opening:['Quẻ Viên nhắc rằng sự đủ đầy không nhất thiết phải đến từ việc có tất cả.','Một vòng tròn đang dần khép lại theo hướng nhẹ lòng hơn.','Đây là lúc thích hợp để kết nối lại với những điều thật sự quan trọng.'],direction:['Hãy hoàn thành một việc còn dang dở để tạo chỗ cho khởi đầu mới.','Dành thời gian thật sự có mặt bên những người quan trọng với bạn.','Đừng để những điều nhỏ làm che mất bức tranh lớn đang khá trọn vẹn.'],ending:['Bình an bên người mình thương đã là một sự viên mãn.','Khép được một vòng cũ sẽ mở được một vòng mới.','Đủ đầy bắt đầu từ cảm giác biết trân trọng.'],whispers:['Trăng tròn vì đủ một vòng, người an vì biết đủ lòng.','Đoàn viên không chỉ là ở gần, mà là thật sự hiện diện.','Có những điều hoàn thành bằng một lời cảm ơn.']},
    nguyen:{name:'QUẺ NGUYỆN',symbol:'「 NGUYỆN 」',poemA:['Đèn bay theo gió','Ước gửi theo trăng','Ngọn đèn vừa sáng','Một điều ươm trong lòng'],poemB:['ước theo trời cao','hy vọng nảy mầm','ước vọng còn xanh','ngày mai có lối'],opening:['Điều bạn mong muốn cần thêm một bước chủ động từ chính bạn.','Ước nguyện này có ý nghĩa vì nó gắn với điều bạn thật sự quan tâm.','Bạn đã có mong muốn; phần còn lại là biến nó thành một bước đi cụ thể.'],direction:['Hãy chọn một việc có thể làm trong 24 giờ tới để tiến gần mục tiêu.','Chia mong muốn lớn thành những mốc nhỏ có thể kiểm chứng.','Viết ra điều bạn mong và bước đầu tiên cần làm để nó bớt mơ hồ.'],ending:['Trăng có thể soi đường, nhưng bước đi vẫn là của bạn.','Ước nguyện đẹp nhất là ước nguyện có hành động đi cùng.','Mỗi bước thật nhỏ vẫn là một lần đến gần hơn.'],whispers:['Ước dưới trăng, làm dưới nắng.','Hy vọng đẹp nhất khi có một bước chân đi cùng.','Điều ước bắt đầu trở thành thật từ lúc bạn bắt đầu.']},
    tam:{name:'QUẺ TÂM',symbol:'「 TÂM 」',poemA:['Mây qua rồi nhẹ','Lòng yên trăng tỏ','Gió lặng bên song','Một đêm nghe lòng'],poemB:['tâm tĩnh rồi an','ý sáng đường thông','buồn vui đều nhẹ','biết mình cần gì'],opening:['Bạn không cần giải quyết mọi thứ trong cùng một lúc.','Có vẻ bạn đã mang theo quá nhiều suy nghĩ trong một khoảng thời gian khá dài.','Quẻ Tâm khuyên bạn quay lại với điều mình thật sự cảm nhận thay vì tiếng ồn xung quanh.'],direction:['Hãy ưu tiên điều quan trọng nhất và cho mình một khoảng nghỉ cần thiết.','Tách điều bạn có thể kiểm soát khỏi điều nằm ngoài khả năng của mình.','Một buổi tối yên tĩnh không màn hình có thể giúp bạn lấy lại nhịp.'],ending:['Tâm sáng khi bớt ôm quá nhiều điều không cần thiết.','Sự rõ ràng thường đến sau một khoảng lặng.','Bạn có quyền nghỉ trước khi tiếp tục.'],whispers:['Tâm an thì trăng nào cũng sáng.','Không phải mọi khoảng lặng đều là trống rỗng.','Đôi khi nghỉ ngơi cũng là một phần của hành trình.']}
  };

  Object.assign(THEMES,{
    khai:{name:'QUẺ KHAI',symbol:'「 KHAI 」',poemA:['Trăng mở đầu canh','Cửa mới vừa hé','Đèn soi lối mới','Sương tan trước ngõ'],poemB:['khởi tâm thành ý','bước mới hanh thông','mầm xanh thức giấc','đường mới dần khai'],opening:['Một khởi đầu mới đang cần bạn chủ động mở cánh cửa đầu tiên.','Điều tưởng như bế tắc có thể chuyển hướng nếu bạn thử một cách làm khác.','Đây là giai đoạn thích hợp để bắt đầu việc đã trì hoãn khá lâu.'],direction:['Hãy chọn một bước nhỏ đủ rõ và làm ngay thay vì chờ mọi điều hoàn hảo.','Dọn bớt việc cũ để tạo khoảng trống cho điều mới xuất hiện.','Bắt đầu bằng phần đơn giản nhất để tạo đà cho chặng tiếp theo.'],ending:['Khởi đầu tốt không cần lớn, chỉ cần thật.','Cánh cửa mới thường mở sau một quyết định nhỏ.','Đi một bước là đã khác với đứng yên.'],whispers:['Muốn thấy đường mới, hãy dám bước khỏi lối quen.','Mỗi khởi đầu đều từng là một điều chưa chắc chắn.','Đèn chỉ sáng khi được thắp lên.']},
    hy:{name:'QUẺ HỶ',symbol:'「 HỶ 」',poemA:['Đèn hồng trước cửa','Trăng vui qua ngõ','Hoa cười trong gió','Tin lành theo nguyệt'],poemB:['niềm vui ghé đến','hỷ sự gần bên','lòng thêm rạng rỡ','nụ cười nở hoa'],opening:['Một tin vui hoặc khoảnh khắc đáng nhớ có thể đến từ điều rất bình dị.','Năng lượng tích cực quanh bạn đang nhiều hơn trước.','Quẻ Hỷ nhắc bạn đừng bỏ qua những điều nhỏ đang làm ngày hôm nay trở nên đẹp hơn.'],direction:['Hãy chia sẻ niềm vui với người thân thay vì giữ riêng cho mình.','Cho phép bản thân tận hưởng một thành quả dù nó chưa thật lớn.','Một lời chúc hoặc lời cảm ơn chân thành sẽ làm niềm vui lan xa hơn.'],ending:['Niềm vui được sẻ chia thường ở lại lâu hơn.','Có những ngày đẹp chỉ vì ta chịu nhìn thấy điều đẹp.','Hỷ khí bắt đầu từ một lòng biết ơn.'],whispers:['Vui một chút, lòng sáng một vùng.','Tin lành thích ghé nơi có nụ cười.','Hỷ đến không ồn ào, nhưng đủ làm lòng ấm.']},
    hoa:{name:'QUẺ HÒA',symbol:'「 HÒA 」',poemA:['Gió hòa cùng nguyệt','Hai bờ chung nước','Mây trời gặp gió','Đèn gần đèn sáng'],poemB:['lòng người dịu lại','chuyện cũ nhẹ tênh','ý hòa thành thuận','tình thêm ấm áp'],opening:['Một khác biệt có thể được tháo gỡ khi cả hai phía chịu nghe nhau thêm một chút.','Quẻ Hòa thiên về cân bằng, hợp tác và tìm điểm chung.','Điều bạn cần lúc này có thể không phải thắng, mà là cùng đi tiếp.'],direction:['Hãy nói điều mình cần bằng ngôn ngữ rõ ràng nhưng mềm mại.','Tách vấn đề khỏi con người để cuộc trao đổi bớt căng thẳng.','Nếu có thể, hãy chọn một giải pháp mà cả hai bên đều giữ được điều quan trọng.'],ending:['Hòa không phải là giống nhau, mà là biết cùng tồn tại.','Một lời dịu có thể mở một cánh cửa đã khép lâu.','Điểm chung luôn dễ thấy hơn khi lòng bớt phòng thủ.'],whispers:['Hòa khí sinh đường rộng.','Mềm không có nghĩa là yếu.','Nghe nhau đủ lâu, nhiều nút thắt tự lỏng.']},
    vuong:{name:'QUẺ VƯỢNG',symbol:'「 VƯỢNG 」',poemA:['Nguyệt cao soi rộng','Lộc xanh thêm nhánh','Đèn lên thành dải','Nước đầy theo nguyệt'],poemB:['thế vận dần lên','việc lành sinh trưởng','cơ hội nối nhau','đường dài thêm rộng'],opening:['Nền tảng bạn xây trước đây đang bắt đầu tạo ra nhiều lựa chọn hơn.','Quẻ Vượng thiên về giai đoạn phát triển từ những gì đã được chăm sóc đều đặn.','Một cơ hội mở rộng có thể xuất hiện khi bạn đã đủ vững ở phần cốt lõi.'],direction:['Tập trung củng cố thứ đang hoạt động tốt trước khi mở rộng quá nhanh.','Đầu tư thêm vào kỹ năng hoặc mối quan hệ đang tạo giá trị thực.','Hãy giữ kỷ luật khi mọi thứ bắt đầu thuận lợi, đó là lúc dễ chủ quan nhất.'],ending:['Vượng bền nhờ gốc chắc.','Phát triển tốt là phát triển vẫn giữ được thăng bằng.','Cái lớn lên đẹp nhất từ điều được chăm đều.'],whispers:['Có gốc mới có cành.','Khi vận lên, càng cần giữ nhịp.','Thịnh không ở chỗ nhiều, mà ở chỗ bền.']},
    thanh:{name:'QUẺ THÀNH',symbol:'「 THÀNH 」',poemA:['Trăng tròn cuối canh','Đường dài đến bến','Đèn soi trang cuối','Công phu kết quả'],poemB:['việc nay sắp trọn','thành tựu gần kề','nỗ lực nên hình','quả ngọt chờ tay'],opening:['Một mục tiêu bạn theo đuổi đang tiến gần giai đoạn có thể nhìn thấy kết quả.','Quẻ Thành nhắc rằng công sức tích lũy không mất đi, dù tiến độ từng có lúc chậm.','Bạn đang ở đoạn cần hoàn thiện nhiều hơn là bắt đầu lại.'],direction:['Hãy rà soát những chi tiết cuối cùng thay vì mở thêm mục tiêu mới.','Kết thúc việc cũ thật gọn sẽ giúp thành quả rõ ràng hơn.','Đừng để sự cầu toàn khiến bạn trì hoãn việc hoàn tất.'],ending:['Hoàn thành cũng là một năng lực.','Đi đến cuối đường quan trọng không kém việc bắt đầu.','Thành quả xứng đáng với người chịu đi hết chặng.'],whispers:['Sắp đến đích thì càng nên vững bước.','Xong một việc, lòng nhẹ một phần.','Trăng tròn là nhờ đi đủ một vòng.']},
    minh:{name:'QUẺ MINH',symbol:'「 MINH 」',poemA:['Mây tan trăng hiện','Đèn soi mặt nước','Sương lui trước sáng','Tâm tĩnh thấy đường'],poemB:['ý rõ lòng thông','điều mờ dần sáng','chân tướng hiện ra','quyết định thêm minh'],opening:['Điều đang khiến bạn phân vân có thể sớm trở nên rõ hơn khi có thêm dữ kiện.','Quẻ Minh thiên về sự sáng tỏ, nhìn đúng bản chất và giảm suy đoán.','Bạn có thể đang biết câu trả lời nhiều hơn mình nghĩ, chỉ là chưa tách cảm xúc khỏi sự việc.'],direction:['Viết ra điều đã biết, điều chưa biết và điều chỉ đang đoán.','Hỏi một người có kinh nghiệm nhưng không trực tiếp vướng vào vấn đề.','Đừng quyết định chỉ vì muốn thoát nhanh khỏi cảm giác không chắc chắn.'],ending:['Khi thấy rõ, bước đi tự nhiên nhẹ hơn.','Sự thật đơn giản thường ít ồn ào.','Minh bắt đầu từ việc dám nhìn thẳng.'],whispers:['Trăng không sáng hơn, chỉ là mây đã đi.','Biết mình chưa biết cũng là một dạng sáng suốt.','Rõ lòng trước, rõ đường sau.']},
    gia:{name:'QUẺ GIA',symbol:'「 GIA 」',poemA:['Trăng treo mái ấm','Đèn chờ trước cửa','Bếp hồng còn lửa','Người về chung ngõ'],poemB:['gia hòa phúc đến','nhà ấm lòng yên','tình thân thêm bền','đoàn viên đủ đầy'],opening:['Gia đình hoặc những người thân cận đang là điểm tựa đáng quý trong giai đoạn này.','Quẻ Gia nhắc đến sự kết nối, chăm sóc và những điều bình dị trong mái ấm.','Có một mối quan hệ gia đình đáng để bạn dành thêm thời gian hoặc lời hỏi han.'],direction:['Chủ động một bữa cơm, một cuộc gọi hoặc một lời cảm ơn thật lòng.','Nếu có điều chưa vui, hãy chọn lúc bình tĩnh để nói thay vì để lâu thành khoảng cách.','Dành thời gian hiện diện trọn vẹn bên người thân, dù chỉ một khoảng ngắn.'],ending:['Nhà ấm từ những điều rất nhỏ.','Có người để nhớ về đã là một phần của phúc.','Đoàn viên bắt đầu từ việc thật sự có mặt.'],whispers:['Mái nhà sáng vì có người chờ.','Đi xa để lớn, trở về để ấm.','Tình thân cần được chăm như một ngọn đèn.']},
    thuan:{name:'QUẺ THUẬN',symbol:'「 THUẬN 」',poemA:['Gió thuận đưa đèn','Nước xuôi theo nguyệt','Mây trôi đúng hướng','Thuyền nhẹ qua sông'],poemB:['đường đi bớt trở','việc đến đúng thời','nhịp đời hòa hợp','chuyện dần êm xuôi'],opening:['Một số việc có thể trở nên thuận hơn khi bạn thôi cố cưỡng lại điều không còn phù hợp.','Quẻ Thuận nói về chọn đúng nhịp, đúng thời điểm và biết tận dụng dòng chảy hiện tại.','Bạn đang có cơ hội xử lý một việc khó theo cách đơn giản hơn.'],direction:['Quan sát điều gì đang diễn ra tự nhiên tốt và ưu tiên đi cùng nó.','Đừng dùng quá nhiều sức cho một hướng liên tục cho tín hiệu không phù hợp.','Linh hoạt cách làm nhưng giữ nguyên mục tiêu cốt lõi.'],ending:['Thuận không phải là không có khó, mà là biết đi cùng nhịp.','Đúng thời điểm giúp một bước nhẹ bằng nhiều bước gắng sức.','Biết thuận dòng cũng là một dạng khôn ngoan.'],whispers:['Gió thuận thì đèn bay cao.','Không phải cánh cửa nào cũng cần đẩy thật mạnh.','Thuận lòng, thuận việc, thuận đường.']}
  });

  const pick=(a)=>a[Math.floor(Math.random()*a.length)];
  const r=(min,max)=>Math.random()*(max-min)+min;
  const themeKeys=Object.keys(THEMES);
  const normalize=(s)=>String(s??'').normalize('NFC');
  const escapeHtml=(s)=>normalize(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function buildStars(){const box=$('stars');for(let i=0;i<105;i++){const s=document.createElement('i');s.className='star'+(Math.random()>.87?' big':'');s.style.left=r(0,100)+'%';s.style.top=r(0,85)+'%';s.style.opacity=r(.25,1);s.style.setProperty('--d',r(2.5,6)+'s');box.appendChild(s)}}
  function setScene(scene){[introScene,flightScene,palaceScene].forEach(x=>x.classList.remove('active'));scene.classList.add('active')}
  function toast(msg){const t=$('toast');t.textContent=normalize(msg);t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2700)}
  function startMusic(){if(!soundOn)return;bgMusic.volume=.28;bgMusic.play().catch(()=>{})}
  function toggleMusic(){soundOn=!soundOn;$('soundBtn').textContent=soundOn?'♫':'♪';if(soundOn)startMusic();else bgMusic.pause()}
  function setGuideOpen(open){
    if(!guideBubble||!guideToggle) return;
    guideBubble.classList.toggle('is-hidden', !open);
    guideToggle.classList.toggle('is-open', open);
    guideToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    const label=guideToggle.querySelector('span');
    if(label) label.textContent = open ? 'Ẩn gợi ý' : 'Hiện gợi ý';
  }

  function generateFortune(key){const t=THEMES[key]||THEMES.an;return{name:t.name,symbol:t.symbol,poem:`${pick(t.poemA)}, ${pick(t.poemB)}.`,message:`${pick(t.opening)} ${pick(t.direction)} ${pick(t.ending)}`,whisper:`“${pick(t.whispers)}”`}}
  function applyFortuneModeUI(){
    const panel=$('fortuneImagePanel');
    const img=$('fortuneImage');
    const card=fortuneModal.querySelector('.fortune-card');
    const isCompany = fortuneMode==='company';
    if(card) card.classList.toggle('has-company-image', isCompany);
    if(panel){
      panel.hidden=!isCompany;
      if(isCompany && img){ img.src=pick(FORTUNE_IMAGES); }
    }
    const modeBtn=$('fortuneModeBtn');
    if(modeBtn) modeBtn.textContent = fortuneMode==='company' ? '🎴 Quẻ: Người công ty' : fortuneMode==='guest' ? '🎴 Quẻ: Khách / Bên ngoài' : '🎴 Chọn loại quẻ';
  }
  function setFortuneMode(mode){
    fortuneMode=mode;
    localStorage.setItem(FORTUNE_MODE_KEY, mode);
    applyFortuneModeUI();
  }
  function askFortuneMode(theme){ pendingFortuneTheme=theme||null; openModal($('fortuneModeModal')); }
  async function drawGuestFortune(){
    try{
      const headers={};
      if(IS_REMOTE_TEST) headers['x-voucher-test-key']=VOUCHER_TEST_KEY;
      const res=await fetch('/api/fortune/guest-draw'+(IS_LOCAL_TEST?'?force=1':''),{method:'POST',credentials:'same-origin',cache:'no-store',headers});
      const data=await res.json().catch(()=>({}));
      if(res.status===403&&data?.error==='TEST_KEY_INVALID') return {lucky:false,testError:'Mã test voucher không đúng hoặc Cloudflare Secret chưa được cấu hình.'};
      if(!res.ok) throw new Error(data?.message||'draw_failed');
      return data;
    }catch{
      // Không quay voucher bằng frontend để tránh người dùng tự sửa xác suất.
      return {lucky:false,offline:true};
    }
  }
  function configureLuckyVoucher(){
    $('luckyVoucherImage').src=PROMO.image||'assets/voucher/voucher-placeholder.svg';
    $('luckyPromoTitle').textContent=normalize(PROMO.title||'VOUCHER TRUNG THU MAY MẮN');
    $('luckyPromoDescription').textContent=normalize(PROMO.description||'Chúc mừng bạn đã nhận được một ưu đãi đặc biệt từ Nha Khoa Sing.');
    $('luckyConsultantName').textContent=normalize(PROMO.consultantName||'Tư vấn viên Nha Khoa Sing');
    const zalo=$('luckyZaloBtn'), call=$('luckyCallBtn');
    if(PROMO.zaloUrl){zalo.href=PROMO.zaloUrl;zalo.hidden=false}else{zalo.hidden=true}
    if(PROMO.consultantPhone){call.href='tel:'+String(PROMO.consultantPhone).replace(/\s+/g,'');call.hidden=false}else{call.hidden=true}
    $('luckyConfigNote').textContent=normalize(PROMO.note||'');
    $('voucherNameInput').value=localStorage.getItem(SENDER_KEY)||'';
    $('voucherPhoneInput').value='';
    $('voucherConsent').checked=false;
    $('luckyStatus').textContent='';
  }
  function openLuckyVoucher(draw){
    currentVoucherClaim=String(draw?.claim_token||'');
    configureLuckyVoucher();
    const testBadge=$('luckyTestBadge');
    if(testBadge) testBadge.hidden=!draw?.test_mode;
    pauseLanterns();
    openModal(luckyVoucherModal);
  }
  async function openFortune(key){
    if(!fortuneMode){ askFortuneMode(key); return; }
    pauseLanterns();
    if(fortuneMode==='guest'){
      const draw=await drawGuestFortune();
      if(draw?.testError){toast(draw.testError);resumeLanterns();return;}
      if(draw?.lucky){openLuckyVoucher(draw);return;}
      if(draw?.offline) toast('Không kết nối được hệ thống quay voucher; bạn vẫn nhận quẻ thường.');
    }
    const f=generateFortune(key);
    $('fortuneTitle').textContent=normalize(f.name);
    $('fortuneSymbol').textContent=normalize(f.symbol);
    $('fortunePoem').textContent=normalize(f.poem);
    $('fortuneMessage').textContent=normalize(f.message);
    $('fortuneWhisper').textContent=normalize(f.whisper);
    applyFortuneModeUI();
    openModal(fortuneModal);
  }
  function completeFortuneMode(mode){
    setFortuneMode(mode);
    closeModal($('fortuneModeModal'));
    if(pendingFortuneTheme){ const theme=pendingFortuneTheme; pendingFortuneTheme=null; openFortune(theme); }
  }
  function toggleCharacterBubble(character){
    const configs={
      cuoi:{bubble:cuoiBubble, text:$('cuoiBubbleText'), lines:CUOI_LINES},
      hang:{bubble:hangBubble, text:$('hangBubbleText'), lines:HANG_LINES}
    };
    const current=configs[character]; if(!current||!current.bubble) return;
    const other=character==='cuoi'?configs.hang:configs.cuoi;
    const isOpen=current.bubble.classList.contains('is-open');
    if(other?.bubble) { other.bubble.classList.remove('is-open'); other.bubble.setAttribute('aria-hidden','true'); }
    if(isOpen){ current.bubble.classList.remove('is-open'); current.bubble.setAttribute('aria-hidden','true'); return; }
    if(current.text) current.text.textContent = pick(current.lines);
    current.bubble.classList.add('is-open');
    current.bubble.setAttribute('aria-hidden','false');
  }

  function configureLantern(el,seed=false){const duration=r(20,30);el.style.left=r(3,94)+'%';el.style.setProperty('--duration',duration+'s');el.style.setProperty('--delay',(seed?r(-duration*.9,-1):0)+'s');el.style.setProperty('--scale',r(.78,1.14));el.style.setProperty('--s1',r(-26,26)+'px');el.style.setProperty('--s2',r(-30,30)+'px');el.style.setProperty('--s3',r(-24,24)+'px');el.style.setProperty('--drift',r(-38,38)+'px');el.dataset.theme=pick(themeKeys);el.querySelector('img').src=pick(LANTERNS)}
  function createLantern(seed=true){const b=document.createElement('button');b.type='button';b.className='sky-lantern';b.setAttribute('aria-label','Mở quẻ Trung Thu');b.innerHTML='<img alt="Lồng đèn Trung Thu" draggable="false">';configureLantern(b,seed);
    b.addEventListener('pointerenter',()=>{b.style.animationPlayState='paused';b.classList.add('hovered')});
    b.addEventListener('pointerleave',()=>{b.classList.remove('hovered');if(!document.querySelector('.modal.open'))b.style.animationPlayState='running'});
    b.addEventListener('pointerdown',(e)=>{e.preventDefault();e.stopPropagation();b.style.animationPlayState='paused';openFortune(b.dataset.theme)});
    b.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openFortune(b.dataset.theme)}});
    b.addEventListener('animationend',()=>{configureLantern(b,false);b.style.animation='none';void b.offsetWidth;b.style.animation='';});return b}
  function buildLanterns(){lanternField.replaceChildren();for(let i=0;i<LANTERN_COUNT;i++)lanternField.appendChild(createLantern(true))}
  function pauseLanterns(){lanternField.querySelectorAll('.sky-lantern').forEach(x=>x.style.animationPlayState='paused')}
  function resumeLanterns(){lanternField.querySelectorAll('.sky-lantern').forEach(x=>{x.classList.remove('hovered');x.style.animationPlayState='running'})}

  function openModal(m){m.classList.add('open');m.setAttribute('aria-hidden','false')}
  function closeModal(m){
    m.classList.remove('open');
    m.setAttribute('aria-hidden','true');
    if(m===fortuneModal || m===luckyVoucherModal || m===$('fortuneModeModal')) resumeLanterns();
    if(m===$('fortuneModeModal')) pendingFortuneTheme=null;
  }
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal($(b.dataset.close))));
  [fortuneModal,luckyVoucherModal,wishModal,wishesModal].forEach(m=>m.addEventListener('pointerdown',e=>{if(e.target===m)closeModal(m)}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal.open').forEach(closeModal)});

  function localWishes(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]')}catch{return[]}}
  function saveLocal(sender_name,message){const a=localWishes();a.unshift({id:Date.now(),sender_name,message,created_at:new Date().toISOString()});localStorage.setItem(LOCAL_KEY,JSON.stringify(a.slice(0,200)));return a[0]}
  async function checkApi(){try{const res=await fetch('/api/wishes/mine?limit=1',{cache:'no-store',credentials:'same-origin'});if(!res.ok)throw 0;apiMode='shared';$('storageHint').textContent='Lời ước được lưu riêng cho thiết bị này';return true}catch{apiMode='local';$('storageHint').textContent='Chế độ thử nghiệm: lưu trên trình duyệt này';return false}}
  async function fetchWishes(){if(apiMode==='checking')await checkApi();if(apiMode==='shared'){try{const res=await fetch('/api/wishes/mine?limit=200',{cache:'no-store',credentials:'same-origin'});if(res.ok){const data=await res.json();return data.wishes||[]}}catch{apiMode='local'}}return localWishes()}
  async function storeWish(sender_name,message){if(apiMode==='checking')await checkApi();if(apiMode==='shared'){try{const res=await fetch('/api/wishes',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({sender_name,message})});if(res.ok)return{shared:true,data:await res.json()}}catch{}apiMode='local'}return{shared:false,data:saveLocal(sender_name,message)}}
  function fmtDate(v){try{return new Date(v).toLocaleString('vi-VN')}catch{return''}}
  async function renderWishes(){const list=$('wishesList');list.innerHTML='<div class="empty">Đang tải…</div>';const wishes=await fetchWishes();$('wishBadge').textContent=wishes.length;list.innerHTML=wishes.length?wishes.map(w=>`<article class="wish-row"><time>${escapeHtml(fmtDate(w.created_at||w.createdAt))}</time><span class="sender">${escapeHtml(w.sender_name||w.senderName||'Ẩn danh')}</span><p>${escapeHtml(w.message||w.text)}</p></article>`).join(''):'<div class="empty">Chưa có ước nguyện nào.</div>'}
  function csvOf(items){const q=(v)=>'"'+String(v??'').replace(/"/g,'""')+'"';return '\ufeffSTT,Thời gian,Tên / thiết bị,Ước nguyện\r\n'+items.map((w,i)=>[i+1,fmtDate(w.created_at||w.createdAt),w.sender_name||w.senderName||'Ẩn danh',w.message||w.text].map(q).join(',')).join('\r\n')}
  async function exportCsv(){if(apiMode==='checking')await checkApi();if(apiMode==='shared'){try{const res=await fetch('/api/wishes/mine.csv',{cache:'no-store',credentials:'same-origin'});if(res.ok){download(await res.blob(),'uoc-nguyen-cua-toi.csv');return}}catch{}}const items=await fetchWishes();download(new Blob([csvOf(items)],{type:'text/csv;charset=utf-8'}),'uoc-nguyen-cua-toi.csv')}
  function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

  async function submitVoucherLead(){
    const name=normalize($('voucherNameInput').value.trim());
    const phone=$('voucherPhoneInput').value.trim();
    const consent=$('voucherConsent').checked;
    const status=$('luckyStatus');
    if(!currentVoucherClaim){status.textContent='Không tìm thấy mã voucher hợp lệ.';return}
    if(!phone){status.textContent='Hãy nhập số điện thoại để tư vấn viên liên hệ.';$('voucherPhoneInput').focus();return}
    if(!consent){status.textContent='Bạn cần đồng ý để Nha Khoa Sing liên hệ tư vấn.';return}
    const btn=$('voucherCallbackBtn');btn.disabled=true;btn.textContent='Đang gửi…';status.textContent='';
    try{
      const res=await fetch('/api/voucher-leads',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({claim_token:currentVoucherClaim,customer_name:name,phone,consent:true})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data.error||'Không gửi được yêu cầu');
      if(name) localStorage.setItem(SENDER_KEY,name);
      status.textContent='✓ Đã gửi yêu cầu. Tư vấn viên sẽ liên hệ với bạn.';
      btn.textContent='✓ Đã gửi yêu cầu gọi lại';
      return;
    }catch(e){status.textContent=normalize(e.message||'Có lỗi xảy ra, vui lòng thử lại.');btn.disabled=false;btn.textContent='📞 Yêu cầu tư vấn gọi lại'}
  }

  function launchSentLantern(){const img=document.createElement('img');img.className='sent-lantern';img.src=pick(LANTERNS);$('wishFlightLayer').appendChild(img);setTimeout(()=>img.remove(),5700)}
  async function sendWish(){const sender=$('senderInput');const input=$('wishInput');const sender_name=normalize(sender.value.trim());const message=normalize(input.value.trim());if(!sender_name){toast('Hãy nhập tên người gửi hoặc tên thiết bị nhé');sender.focus();return}if(!message){toast('Hãy viết một điều ước trước khi thả đèn nhé 🏮');input.focus();return}localStorage.setItem(SENDER_KEY,sender_name);const button=$('sendWishBtn');button.disabled=true;button.textContent='Đang gửi…';const result=await storeWish(sender_name,message);button.disabled=false;button.textContent='Thả đèn lên trời';input.value='';updateCount();closeModal(wishModal);launchSentLantern();toast(result.shared?`Đã gửi ước nguyện của ${sender_name} lên Cung Trăng ✨`:`Đã lưu ước nguyện của ${sender_name} trên trình duyệt này ✨`);await renderWishes()}
  function updateCount(){$('wishCount').textContent=`${$('wishInput').value.length}/160`}

  $('releaseBtn').addEventListener('click',()=>{startMusic();setScene(flightScene);flightScene.classList.add('is-flying');setTimeout(()=>{flightScene.classList.remove('is-flying');buildLanterns();setScene(palaceScene);setGuideOpen(true);toast('Chào mừng bạn đến Cung Trăng ✨')},4100)});
  $('homeBtn').addEventListener('click',()=>{setScene(introScene); if(cuoiBubble){cuoiBubble.classList.remove('is-open');cuoiBubble.setAttribute('aria-hidden','true');} if(hangBubble){hangBubble.classList.remove('is-open');hangBubble.setAttribute('aria-hidden','true');} toast('Hẹn gặp lại trên Cung Trăng 🌕')});
  $('fortuneModeBtn').addEventListener('click',()=>askFortuneMode(null));
  $('companyModeBtn').addEventListener('click',()=>completeFortuneMode('company'));
  $('guestModeBtn').addEventListener('click',()=>completeFortuneMode('guest'));
  $('writeWishBtn').addEventListener('click',()=>{const sender=$('senderInput');if(!sender.value)sender.value=localStorage.getItem(SENDER_KEY)||'';openModal(wishModal);setTimeout(()=>{(sender.value?$('wishInput'):sender).focus()},100)});
  $('viewWishesBtn').addEventListener('click',async()=>{openModal(wishesModal);await renderWishes()});
  $('refreshWishesBtn').addEventListener('click',renderWishes);$('exportWishesBtn').addEventListener('click',exportCsv);$('sendWishBtn').addEventListener('click',sendWish);$('wishInput').addEventListener('input',updateCount);$('soundBtn').addEventListener('click',toggleMusic);
  $('voucherCallbackBtn').addEventListener('click',submitVoucherLead);
  if(guideToggle) guideToggle.addEventListener('click',()=>setGuideOpen(guideBubble.classList.contains('is-hidden')));
  if(guideBubble) guideBubble.addEventListener('click',()=>setGuideOpen(false));
  if(characterCuoi){ characterCuoi.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleCharacterBubble('cuoi')}}); }
  if(characterHang){ characterHang.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleCharacterBubble('hang')}}); }
  // Capture clicks by geometry so floating lanterns cannot block Chú Cuội / Chị Hằng.
  palaceScene.addEventListener('pointerdown',(e)=>{
    if(document.querySelector('.modal.open')) return;
    // Bong bóng có listener riêng để đóng; không để vùng bắt click nhân vật xử lý lại.
    if(e.target.closest?.('.character-bubble')) return;
    const inside=(rect,pad=16)=>e.clientX>=rect.left-pad&&e.clientX<=rect.right+pad&&e.clientY>=rect.top-pad&&e.clientY<=rect.bottom+pad;
    const cuoiRect=characterCuoi?.getBoundingClientRect();
    const hangImg=characterHang?.querySelector('img');
    const hangRect=hangImg?.getBoundingClientRect();
    if(cuoiRect&&inside(cuoiRect,18)){
      e.preventDefault();
      e.stopPropagation();
      toggleCharacterBubble('cuoi');
      return;
    }
    if(hangRect&&inside(hangRect,18)){
      e.preventDefault();
      e.stopPropagation();
      toggleCharacterBubble('hang');
    }
  },true);
  if(cuoiBubble) cuoiBubble.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();toggleCharacterBubble('cuoi')});
  if(hangBubble) hangBubble.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();toggleCharacterBubble('hang')});

  $('senderInput').value=localStorage.getItem(SENDER_KEY)||'';
  const testBanner=$('voucherTestBanner');
  if(testBanner) testBanner.hidden=!(IS_LOCAL_TEST||IS_REMOTE_TEST);
  setGuideOpen(true);
  applyFortuneModeUI();
  configureLuckyVoucher();
  buildStars();buildLanterns();updateCount();checkApi().then(renderWishes);
  if(new URLSearchParams(location.search).get('scene')==='palace')setScene(palaceScene);
})();
