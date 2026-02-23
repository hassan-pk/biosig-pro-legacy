declare
    l_base64 clob := :P2_SIG;
    l_blob   blob;
begin
    if l_base64 is not null and length(trim(l_base64)) > 0 then
        l_blob := apex_web_service.clobbase642blob(l_base64);
        if dbms_lob.getlength(l_blob) > 0 then
            insert into uploads (
                uplo_file_blob,
                uplo_file_mime,
                uplo_file_name,
                uplo_created_by,
                uplo_created
            ) values (
                l_blob,
                'image/png',
                'signature_' || to_char(sysdate, 'YYYYMMDD_HH24MISS') || '.png',
                :app_user,
                sysdate
            )
            returning uplo_id into :P2_UPLO_ID;
            :P2_SIG := null;
        end if;
    end if;
end;
