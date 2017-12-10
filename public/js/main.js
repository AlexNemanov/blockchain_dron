$( document ).ready(function() {

    function addInputToForm(form, name, value) {
        form.find('input[name="' + name + '"]').remove();    
        $('<input />').attr('type', 'hidden')
            .attr('name', name)
            .attr('value', value)
            .appendTo(form);
    }

    $('#fsub').click(function() {
        var dAarive = new Date();
        var sign = clientApi.sign($('#order_id').val(), dAarive, $('#status').val(), $('#pk').val());
        
        addInputToForm($('#order_form'), 'sgn_r', sign.r);
        addInputToForm($('#order_form'), 'sgn_s', sign.s);
        addInputToForm($('#order_form'), 'sgn_v', sign.v);

        $('#order_form').submit();
    });
});
